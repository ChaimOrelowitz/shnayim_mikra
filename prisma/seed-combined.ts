import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function pesukim(ranges: { perek: number; from: number; to: number }[]) {
  return ranges.flatMap(({ perek, from, to }) =>
    Array.from({ length: to - from + 1 }, (_, i) => ({ perek, pasuk: from + i }))
  );
}

async function main() {
  // ── Tazria-Metzora combined (order 101) ──────────────────────────────────
  const existing = await prisma.parsha.findFirst({ where: { order: 101 } });
  if (existing) {
    console.log('⏭️  Tazria-Metzora already exists');
  } else {
    await prisma.parsha.create({
      data: {
        name: 'תזריע-מצורע',
        englishName: 'Tazria-Metzora',
        order: 101,
        aliyos: {
          create: [
            { number: 1, pesukim: { create: pesukim([{ perek: 12, from: 1, to: 8 }]) } },
            { number: 2, pesukim: { create: pesukim([{ perek: 13, from: 1, to: 17 }]) } },
            { number: 3, pesukim: { create: pesukim([{ perek: 13, from: 18, to: 28 }]) } },
            { number: 4, pesukim: { create: pesukim([{ perek: 13, from: 29, to: 59 }]) } },
            { number: 5, pesukim: { create: pesukim([{ perek: 14, from: 1, to: 32 }]) } },
            { number: 6, pesukim: { create: pesukim([{ perek: 14, from: 33, to: 57 }, { perek: 15, from: 1, to: 15 }]) } },
            { number: 7, pesukim: { create: pesukim([{ perek: 15, from: 16, to: 33 }]) } },
          ],
        },
      },
    });
    console.log('✅ Seeded Tazria-Metzora combined');
  }
}

main().finally(() => prisma.$disconnect());
