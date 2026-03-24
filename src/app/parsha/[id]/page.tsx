import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ParshaPageContent } from '@/components/ParshaPageContent';

export const dynamic = 'force-dynamic';

interface ParshaPageProps {
  params: Promise<{ id: string }>;
}

export default async function ParshaPage({ params }: ParshaPageProps) {
  const { id } = await params;

  const parsha = await prisma.parsha.findUnique({
    where: { id },
    include: {
      aliyos: {
        orderBy: { number: 'asc' },
      },
    },
  });

  if (!parsha) {
    notFound();
  }

  return <ParshaPageContent parsha={parsha} />;
}
