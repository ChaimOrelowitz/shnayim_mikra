import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function pesukim(ranges: { perek: number; from: number; to: number }[]) {
  return ranges.flatMap(({ perek, from, to }) =>
    Array.from({ length: to - from + 1 }, (_, i) => ({ perek, pasuk: from + i }))
  );
}

type AliyahDef = {
  number: number;
  ranges: { perek: number; from: number; to: number }[];
};

async function seedParsha(name: string, order: number, aliyos: AliyahDef[]) {
  const existing = await prisma.parsha.findFirst({ where: { order } });
  if (existing) {
    console.log(`⏭️  Skipping ${name} (already exists)`);
    return;
  }

  const parsha = await prisma.parsha.create({
    data: {
      name,
      order,
      aliyos: {
        create: aliyos.map(({ number, ranges }) => ({
          number,
          pesukim: { create: pesukim(ranges) },
        })),
      },
    },
  });

  const total = aliyos.reduce((sum, a) =>
    sum + a.ranges.reduce((s, r) => s + (r.to - r.from + 1), 0), 0
  );
  console.log(`✅ Seeded ${parsha.name} — ${aliyos.length} aliyos, ${total} pesukim`);
}

async function main() {
  console.log('🌱 Seeding database...');

  // ── Bereishit (Bereishit 1:1 – 6:8) ──────────────────────────────────────
  await seedParsha('בראשית', 1, [
    { number: 1, ranges: [{ perek: 1, from: 1, to: 31 }, { perek: 2, from: 1, to: 3 }] },
    { number: 2, ranges: [{ perek: 2, from: 4, to: 19 }] },
    { number: 3, ranges: [{ perek: 2, from: 20, to: 25 }, { perek: 3, from: 1, to: 21 }] },
    { number: 4, ranges: [{ perek: 3, from: 22, to: 24 }, { perek: 4, from: 1, to: 18 }] },
    { number: 5, ranges: [{ perek: 4, from: 19, to: 22 }] },
    { number: 6, ranges: [{ perek: 4, from: 23, to: 26 }, { perek: 5, from: 1, to: 24 }] },
    { number: 7, ranges: [{ perek: 5, from: 25, to: 32 }, { perek: 6, from: 1, to: 8 }] },
  ]);

  // ── Vayikra (Vayikra 1:1 – 5:26) ────────────────────────────────────────
  await seedParsha('ויקרא', 24, [
    { number: 1, ranges: [{ perek: 1, from: 1, to: 13 }] },
    { number: 2, ranges: [{ perek: 1, from: 14, to: 17 }, { perek: 2, from: 1, to: 16 }] },
    { number: 3, ranges: [{ perek: 3, from: 1, to: 17 }] },
    { number: 4, ranges: [{ perek: 4, from: 1, to: 26 }] },
    { number: 5, ranges: [{ perek: 4, from: 27, to: 35 }, { perek: 5, from: 1, to: 10 }] },
    { number: 6, ranges: [{ perek: 5, from: 11, to: 19 }] },
    { number: 7, ranges: [{ perek: 5, from: 20, to: 26 }] },
  ]);

  // ── Tzav (Vayikra 6:1 – 8:36) ────────────────────────────────────────────
  await seedParsha('צו', 25, [
    { number: 1, ranges: [{ perek: 6, from: 1, to: 11 }] },
    { number: 2, ranges: [{ perek: 6, from: 12, to: 23 }, { perek: 7, from: 1, to: 10 }] },
    { number: 3, ranges: [{ perek: 7, from: 11, to: 38 }] },
    { number: 4, ranges: [{ perek: 8, from: 1, to: 13 }] },
    { number: 5, ranges: [{ perek: 8, from: 14, to: 21 }] },
    { number: 6, ranges: [{ perek: 8, from: 22, to: 29 }] },
    { number: 7, ranges: [{ perek: 8, from: 30, to: 36 }] },
  ]);

  console.log('🎉 Done');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
