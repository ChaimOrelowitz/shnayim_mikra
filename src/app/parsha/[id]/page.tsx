import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { ParshaPageContent } from '@/components/ParshaPageContent';
import { currentHebrewYear } from '@/lib/hebcal';

export const dynamic = 'force-dynamic';

interface ParshaPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string }>;
}

export default async function ParshaPage({ params, searchParams }: ParshaPageProps) {
  const { id } = await params;
  const { year } = await searchParams;
  const hebrewYear = year ? parseInt(year, 10) : currentHebrewYear();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

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

  const profile = userId
    ? await prisma.profile.findUnique({ where: { id: userId } })
    : null;

  const parshaWithProgress = {
    ...parsha,
    aliyos: parsha.aliyos.map(a => ({
      ...a,
      done: a.userProgress[0]?.done ?? false,
      mikra1: a.userProgress[0]?.mikra1 ?? false,
      mikra2: a.userProgress[0]?.mikra2 ?? false,
      targum: a.userProgress[0]?.targum ?? false,
    })),
  };

  return (
    <ParshaPageContent
      parsha={parshaWithProgress}
      isAdmin={profile?.role === 'ADMIN'}
      hebrewYear={hebrewYear}
    />
  );
}
