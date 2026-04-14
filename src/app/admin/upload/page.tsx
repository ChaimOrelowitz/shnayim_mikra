import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BulkUploader } from '@/components/BulkUploader';

export const dynamic = 'force-dynamic';

export default async function AdminUploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (profile?.role !== 'ADMIN') redirect('/');

  const parshiyos = await prisma.parsha.findMany({
    orderBy: { order: 'asc' },
    include: {
      aliyos: { orderBy: { number: 'asc' }, select: { id: true, number: true, pdfPath: true } },
    },
  });

  return <BulkUploader parshiyos={parshiyos} />;
}
