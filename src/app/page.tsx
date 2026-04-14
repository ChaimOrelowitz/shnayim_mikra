import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { ParshaList } from '@/components/ParshaList';
import {
  getCurrentParsha,
  getScheduleForYear,
  currentHebrewYear,
  normalizeParsha,
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

  const profile = userId
    ? await prisma.profile.findUnique({ where: { id: userId } })
    : null;

  const location = profile?.location ?? 'CHUL';

  const jar = await cookies();
  const isViewingAsUser = jar.get('shnayim-view-as-user')?.value === '1';

  // Year selector
  const thisYear = currentHebrewYear();
  const hebrewYear = params.year ? parseInt(params.year, 10) : thisYear;
  const availableYears = [thisYear - 1, thisYear, thisYear + 1];

  // Fetch schedule for selected year to determine combined vs individual
  const [schedule, currentParsha] = await Promise.all([
    getScheduleForYear(hebrewYear, location),
    getCurrentParsha(location),
  ]);

  // Build normalized set of names that appear in this year's schedule
  const scheduledNorms = new Set(schedule.map(normalizeParsha));

  const parshiyos = await prisma.parsha.findMany({
    orderBy: { order: 'asc' },
    include: {
      aliyos: {
        orderBy: { number: 'asc' },
        include: {
          userProgress: {
            where: userId ? { userId } : { userId: '' },
          },
        },
      },
    },
  });

  const currentNorm = normalizeParsha(currentParsha);

  const parshiyosWithProgress = parshiyos
    // Only show parshiyos that appear in this year's schedule
    // (removes e.g. individual Tazria/Metzora in a combined year, or the combined when they're split)
    // Fall back to showing everything if schedule fetch failed
    .filter((p) =>
      scheduledNorms.size === 0 ||
      (p.englishName && scheduledNorms.has(normalizeParsha(p.englishName)))
    )
    .map((p) => ({
      ...p,
      // Current parsha: compare by normalized name so spelling variants match
      isCurrent:
        !!currentNorm &&
        !!p.englishName &&
        normalizeParsha(p.englishName) === currentNorm,
      aliyos: p.aliyos.map((a) => ({
        ...a,
        done: a.userProgress[0]?.done ?? false,
        mikra1: a.userProgress[0]?.mikra1 ?? false,
        mikra2: a.userProgress[0]?.mikra2 ?? false,
        targum: a.userProgress[0]?.targum ?? false,
      })),
    }));

  return (
    <ParshaList
      parshiyos={parshiyosWithProgress}
      isAdmin={profile?.role === 'ADMIN'}
      location={location}
      isViewingAsUser={isViewingAsUser}
      hebrewYear={hebrewYear}
      availableYears={availableYears}
    />
  );
}
