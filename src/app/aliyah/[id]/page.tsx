import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { AliyahView } from '@/components/AliyahView';
import { ReaderClient } from './ReaderClient';
import { currentHebrewYear } from '@/lib/hebcal';
import { toHebrewNumeral } from '@/lib/language';

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

  const profile = userId
    ? await prisma.profile.findUnique({ where: { id: userId } })
    : null;

  const useReaderView = profile?.role === 'ADMIN' && profile?.preferredView === 'READER';

  // ── Reader view ──────────────────────────────────────────────────────────────
  if (useReaderView) {
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
            rashiComments: { orderBy: { sortOrder: 'asc' } },
            userProgress: {
              where: userId ? { userId, hebrewYear } : { userId: '' },
            },
          },
        },
      },
    });

    if (!aliyah) notFound();

    const verses = aliyah.pesukim.map((p) => ({
      id: p.id,
      ref: `${p.perek}:${p.pasuk}`,
      hebrewRef: `${toHebrewNumeral(p.perek)}:${toHebrewNumeral(p.pasuk)}`,
      mikra: p.hebrewText,
      targum: p.targumText ?? '',
      rashi: p.rashiComments.map((r) => ({
        dibburHamaschil: r.dibburHamaschil,
        text: r.text,
      })),
    }));

    // Last pasuk in order where done === true is the saved bookmark
    const donePasukim = aliyah.pesukim.filter((p) => p.userProgress[0]?.done);
    const initialSavedVerseId = donePasukim.length > 0
      ? donePasukim[donePasukim.length - 1].id
      : null;

    return (
      <ReaderClient
        aliyahId={aliyah.id}
        parshaId={aliyah.parshaId}
        hebrewYear={hebrewYear}
        verses={verses}
        parshaName={aliyah.parsha.name}
        aliyahNumber={aliyah.number}
        initialSavedVerseId={initialSavedVerseId}
        initialAliyahDone={aliyah.userProgress[0]?.done ?? false}
        initialRashiDone={aliyah.userProgress[0]?.rashiReview ?? false}
      />
    );
  }

  // ── Classic view ─────────────────────────────────────────────────────────────
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

  const aliyahWithProgress = {
    ...aliyah,
    done: aliyah.userProgress[0]?.done ?? false,
    mikra1: aliyah.userProgress[0]?.mikra1 ?? false,
    mikra2: aliyah.userProgress[0]?.mikra2 ?? false,
    targum: aliyah.userProgress[0]?.targum ?? false,
  };

  const pasukimWithProgress = aliyah.pesukim.map((p) => ({
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
