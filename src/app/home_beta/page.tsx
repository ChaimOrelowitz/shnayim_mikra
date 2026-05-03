import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  getCurrentParsha,
  getScheduleForYear,
  currentHebrewYear,
  normalizeParsha,
} from '@/lib/hebcal';
import { HomePickerClient } from '@/components/HomePickerClient';

export const dynamic = 'force-dynamic';

function todaysAliyahIndex(): number {
  return new Date().getDay();
}

export default async function HomeBetaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) {
    profile = await prisma.profile.upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id, email: user.email!, firstName: user.user_metadata?.firstName ?? null, lastName: user.user_metadata?.lastName ?? null },
    });
  }

  const jar = await cookies();
  const viewAsUser = jar.get('shnayim-view-as-user')?.value === '1';
  if (profile.role === 'ADMIN' && !viewAsUser && profile.preferredView !== 'READER') {
    redirect('/admin');
  }

  const location = profile.location ?? 'CHUL';
  const hebrewYear = currentHebrewYear();

  const [schedule, currentParshaName_] = await Promise.all([
    getScheduleForYear(hebrewYear, location),
    getCurrentParsha(location),
  ]);
  const currentParshaName = currentParshaName_ || schedule[0] || '';
  const scheduledNorms = new Set(schedule.map(normalizeParsha));

  const parshiyot = await prisma.parsha.findMany({
    orderBy: { order: 'asc' },
    include: {
      aliyos: {
        orderBy: { number: 'asc' },
        include: {
          userProgress: {
            where: { userId: user.id, hebrewYear },
          },
        },
      },
    },
  });

  const filteredParshiyot = parshiyot.filter(
    (p) => scheduledNorms.size === 0 || (p.englishName && scheduledNorms.has(normalizeParsha(p.englishName)))
  );

  const currentParsha = filteredParshiyot.find(
    (p) => p.englishName && normalizeParsha(p.englishName) === normalizeParsha(currentParshaName)
  ) ?? filteredParshiyot[0];

  const parshaWithProgress = filteredParshiyot.map((p) => ({
    id: p.id,
    name: p.name,
    englishName: p.englishName ?? '',
    order: p.order,
    aliyos: p.aliyos.map((a) => ({
      id: a.id,
      number: a.number,
      done: a.userProgress[0]?.done ?? false,
    })),
  }));

  return (
    <HomePickerClient
      parshiyot={parshaWithProgress}
      initialParshaId={currentParsha.id}
      initialAliyahIndex={todaysAliyahIndex()}
      hebrewYear={hebrewYear}
    />
  );
}
