import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { ParshaList } from '@/components/ParshaList';
import { getCurrentParsha } from '@/lib/hebcal';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const profile = userId
    ? await prisma.profile.findUnique({ where: { id: userId } })
    : null;

  const location = profile?.location ?? 'CHUL';

  const jar = await cookies();
  const isViewingAsUser = jar.get('shnayim-view-as-user')?.value === '1';

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

  const currentParshaNames = await getCurrentParsha(location);

  const parshiyosWithProgress = parshiyos.map(p => ({
    ...p,
    isCurrent: currentParshaNames.some(
      n => n.toLowerCase() === (p.englishName ?? '').toLowerCase()
    ),
    aliyos: p.aliyos.map(a => ({
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
    />
  );
}
