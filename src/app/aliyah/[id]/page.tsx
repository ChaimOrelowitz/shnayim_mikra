import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AliyahView } from '@/components/AliyahView';

export const dynamic = 'force-dynamic';

interface AliyahPageProps {
  params: Promise<{ id: string }>;
}

export default async function AliyahPage({ params }: AliyahPageProps) {
  const { id } = await params;

  const aliyah = await prisma.aliyah.findUnique({
    where: { id },
    include: {
      parsha: true,
      pesukim: {
        orderBy: [{ perek: 'asc' }, { pasuk: 'asc' }],
      },
    },
  });

  if (!aliyah) {
    notFound();
  }

  return <AliyahView aliyah={aliyah} pesukim={aliyah.pesukim} />;
}
