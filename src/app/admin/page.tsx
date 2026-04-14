import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/AdminDashboard';
import { getYearCalendar } from '@/lib/hebcal';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (profile?.role !== 'ADMIN') redirect('/');

  const users = await prisma.profile.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: {
          aliyahProgress: { where: { done: true } },
        },
      },
    },
  });

  const totalAliyos = await prisma.aliyah.count();
  const totalParshiyos = await prisma.parsha.count();

  const parshiyosWithPdfs = await prisma.parsha.findMany({
    orderBy: { order: 'asc' },
    include: {
      aliyos: {
        orderBy: { number: 'asc' },
        select: { id: true, number: true, pdfPath: true },
      },
    },
  });

  const calendar = await getYearCalendar();

  return (
    <AdminDashboard
      currentUser={profile}
      users={users}
      totalAliyos={totalAliyos}
      totalParshiyos={totalParshiyos}
      parshiyosWithPdfs={parshiyosWithPdfs}
      calendar={calendar}
    />
  );
}
