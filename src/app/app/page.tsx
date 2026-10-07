import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
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

  let profile = userId
    ? await prisma.profile.findUnique({ where: { id: userId } })
    : null;

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

  if (profile?.role === 'ADMIN' && !isViewingAsUser && !isReaderMode) {
    redirect('/admin');
  }

  const thisYear = currentHebrewYear();
  const hebrewYear = params.year ? parseInt(params.year, 10) : thisYear;
  const availableYears = [thisYear - 1, thisYear, thisYear + 1];

  const [schedule, currentParsha] = await Promise.all([
    getScheduleForYear(hebrewYear, location),
    getCurrentParsha(location),
  ]);

  const scheduledNorms = new Set(schedule.map(normalizeParsha));

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

  const currentNorm = normalizeParsha(currentParsha);

  const parshiyosWithProgress = parshiyos
    .filter((p) =>
      scheduledNorms.size === 0 ||
      (p.englishName && scheduledNorms.has(normalizeParsha(p.englishName)))
    )
    .map((p) => ({
      ...p,
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
