import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { AliyahView } from '@/components/AliyahView';
import { currentHebrewYear } from '@/lib/hebcal';

export const dynamic = 'force-dynamic';

interface AliyahPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string }>;
}

export default async function AliyahPage({ params, searchParams }: AliyahPageProps) {
  const { id } = await params;
  const { year } = await searchParams;
  const hebrewYear = year ? parseInt(year, 10) : currentHebrewYear();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const aliyah = await prisma.aliyah.findUnique({
    where: { id },
    include: {
      parsha: true,
      userProgress: {
        where: userId ? { userId, hebrewYear } : { userId: '' },
      },
      pesukim: {
        orderBy: [{ perek: 'asc' }, { pasuk: 'asc' }],
        include: {
          userProgress: {
            where: userId ? { userId, hebrewYear } : { userId: '' },
          },
        },
      },
    },
  });

  if (!aliyah) notFound();

  const profile = userId
    ? await prisma.profile.findUnique({ where: { id: userId } })
    : null;

  const aliyahWithProgress = {
    ...aliyah,
    done: aliyah.userProgress[0]?.done ?? false,
    mikra1: aliyah.userProgress[0]?.mikra1 ?? false,
    mikra2: aliyah.userProgress[0]?.mikra2 ?? false,
    targum: aliyah.userProgress[0]?.targum ?? false,
  };

  const pasukimWithProgress = aliyah.pesukim.map(p => ({
    ...p,
    done: p.userProgress[0]?.done ?? false,
    mikra1: p.userProgress[0]?.mikra1 ?? false,
    mikra2: p.userProgress[0]?.mikra2 ?? false,
    targum: p.userProgress[0]?.targum ?? false,
  }));

  return (
    <AliyahView
      aliyah={aliyahWithProgress}
      pesukim={pasukimWithProgress}
      isAdmin={profile?.role === 'ADMIN'}
      hebrewYear={hebrewYear}
    />
  );
}
