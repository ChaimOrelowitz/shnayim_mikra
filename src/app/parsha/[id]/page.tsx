import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { ParshaPageContent } from '@/components/ParshaPageContent';
import { currentCycleStartYear } from '@/lib/hebcal';

export const dynamic = 'force-dynamic';

interface ParshaPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string }>;
}

export default async function ParshaPage({ params, searchParams }: ParshaPageProps) {
  const { id } = await params;
  const { year } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const profile = userId
    ? await prisma.profile.findUnique({ where: { id: userId } })
    : null;

  // `hebrewYear` is the Torah cycle's start year (5786 = 5786/7)
  const hebrewYear = year ? parseInt(year, 10) : currentCycleStartYear(profile?.location ?? 'CHUL');

  const parsha = await prisma.parsha.findUnique({
    where: { id },
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

  if (!parsha) notFound();

  const parshaWithProgress = {
    ...parsha,
    aliyos: parsha.aliyos.map(a => ({
      ...a,
      done: a.userProgress[0]?.done ?? false,
      mikra1: a.userProgress[0]?.mikra1 ?? false,
      mikra2: a.userProgress[0]?.mikra2 ?? false,
      targum: a.userProgress[0]?.targum ?? false,
      rashiReview: a.userProgress[0]?.rashiReview ?? false,
    })),
  };

  const isReaderMode = profile?.preferredView === 'READER';

  return (
    <ParshaPageContent
      parsha={parshaWithProgress}
      isAdmin={profile?.role === 'ADMIN' && !isReaderMode}
      hebrewYear={hebrewYear}
    />
  );
}
