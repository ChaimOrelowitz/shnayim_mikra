import { prisma } from '@/lib/prisma';
import { ParshaList } from '@/components/ParshaList';

export default async function HomePage() {
  const parshiyos = await prisma.parsha.findMany({
    orderBy: { order: 'asc' },
    include: {
      aliyos: {
        orderBy: { number: 'asc' },
      },
    },
  });

  return <ParshaList parshiyos={parshiyos} />;
}
