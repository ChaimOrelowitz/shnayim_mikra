import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ParshaList } from '@/components/ParshaList';
import {
  getCurrentParsha,
  getCycleSchedule,
  currentCycleStartYear,
  parshaOrderForName,
  SUPPORTED_CYCLES,
} from '@/lib/hebcal';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  let profile = userId
    ? await prisma.profile.findUnique({ where: { id: userId } })
    : null;

  // Auto-create profile for self-signup users on first visit
  if (userId && user && !profile) {
    const meta = user.user_metadata ?? {};
    profile = await prisma.profile.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: user.email!,
        firstName: meta.firstName ?? null,
        lastName: meta.lastName ?? null,
      },
    });
  }

  const location = profile?.location ?? 'CHUL';

  const jar = await cookies();
  const isViewingAsUser = jar.get('shnayim-view-as-user')?.value === '1';
  const isReaderMode = profile?.preferredView === 'READER';

  // Admins without reader mode land on /admin, not the user home page
  if (profile?.role === 'ADMIN' && !isViewingAsUser && !isReaderMode) {
    redirect('/admin');
  }

  // Cycle selector: `hebrewYear` is the cycle's starting Hebrew year (5786 = 5786/7)
  const thisCycle = currentCycleStartYear(location);
  const hebrewYear = params.year ? parseInt(params.year, 10) : thisCycle;
  const availableYears = SUPPORTED_CYCLES;

  // Selected cycle's schedule; the current-week parsha always comes from this week's Shabbat
  const [schedule, currentParsha] = await Promise.all([
    getCycleSchedule(hebrewYear, location),
    getCurrentParsha(location),
  ]);

  const scheduledOrders = new Set(schedule.map((r) => r.order));

  const parshiyos = await prisma.parsha.findMany({
    orderBy: { order: 'asc' },
    include: {
      aliyos: {
        orderBy: { number: 'asc' },
        include: {
          userProgress: {
            where: userId ? { userId, hebrewYear } : { userId: '' },
          },
        },
      },
    },
  });

  const currentOrder = currentParsha ? parshaOrderForName(currentParsha) : undefined;

  const parshiyosWithProgress = parshiyos
    // Only show parshiyos that appear in this year's schedule
    // (removes e.g. individual Tazria/Metzora in a combined year, or the combined when they're split)
    // Fall back to showing everything if schedule fetch failed
    .filter((p) => scheduledOrders.size === 0 || scheduledOrders.has(p.order))
    .map((p) => ({
      ...p,
      // Current parsha: compare by normalized name so spelling variants match
      // Only within the current cycle, so browsing another cycle doesn't mark a parsha current
      isCurrent: hebrewYear === thisCycle && currentOrder !== undefined && p.order === currentOrder,
      aliyos: p.aliyos.map((a) => ({
        ...a,
        done: a.userProgress[0]?.done ?? false,
        mikra1: a.userProgress[0]?.mikra1 ?? false,
        mikra2: a.userProgress[0]?.mikra2 ?? false,
        targum: a.userProgress[0]?.targum ?? false,
        rashiReview: a.userProgress[0]?.rashiReview ?? false,
      })),
    }));

  return (
    <ParshaList
      parshiyos={parshiyosWithProgress}
      isAdmin={profile?.role === 'ADMIN' && !isReaderMode}
      location={location}
      isViewingAsUser={isViewingAsUser}
      hebrewYear={hebrewYear}
      availableYears={availableYears}
    />
  );
}
