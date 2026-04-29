/**
 * Seeds pesukim for combined parshiyot by copying from individual parshiyot.
 * Aliyah boundaries sourced from hebcal/hebcal-leyning aliyot.json.
 * Run: node scripts/seed-combined-parshas.mjs
 */
import { PrismaClient } from '/workspaces/shnayim_mikra/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();

// [perek, pasuk] ranges for each aliyah — from hebcal-leyning source
const COMBINED_PARSHAS = [
  {
    combined: 'Vayakhel-Pekudei',
    singles: ['Vayakhel', 'Pekudei'],
    aliyot: [
      { num: 1, start: [35, 1],  end: [35, 29] },
      { num: 2, start: [35, 30], end: [37, 16] },
      { num: 3, start: [37, 17], end: [37, 29] },
      { num: 4, start: [38, 1],  end: [39, 1]  },
      { num: 5, start: [39, 2],  end: [39, 21] },
      { num: 6, start: [39, 22], end: [39, 43] },
      { num: 7, start: [40, 1],  end: [40, 38] },
    ],
  },
  {
    combined: 'Acharei Mot-Kedoshim',
    singles: ['Acharei Mot', 'Kedoshim'],
    aliyot: [
      { num: 1, start: [16, 1],  end: [16, 24] },
      { num: 2, start: [16, 25], end: [17, 7]  },
      { num: 3, start: [17, 8],  end: [18, 21] },
      { num: 4, start: [18, 22], end: [19, 14] },
      { num: 5, start: [19, 15], end: [19, 32] },
      { num: 6, start: [19, 33], end: [20, 7]  },
      { num: 7, start: [20, 8],  end: [20, 27] },
    ],
  },
  {
    combined: 'Behar-Bechukotai',
    singles: ['Behar', 'Bechukotai'],
    aliyot: [
      { num: 1, start: [25, 1],  end: [25, 18] },
      { num: 2, start: [25, 19], end: [25, 28] },
      { num: 3, start: [25, 29], end: [25, 38] },
      { num: 4, start: [25, 39], end: [26, 9]  },
      { num: 5, start: [26, 10], end: [26, 46] },
      { num: 6, start: [27, 1],  end: [27, 15] },
      { num: 7, start: [27, 16], end: [27, 34] },
    ],
  },
  {
    combined: 'Chukat-Balak',
    singles: ['Chukat', 'Balak'],
    aliyot: [
      { num: 1, start: [19, 1],  end: [20, 6]  },
      { num: 2, start: [20, 7],  end: [20, 21] },
      { num: 3, start: [20, 22], end: [21, 20] },
      { num: 4, start: [21, 21], end: [22, 12] },
      { num: 5, start: [22, 13], end: [22, 38] },
      { num: 6, start: [22, 39], end: [23, 26] },
      { num: 7, start: [23, 27], end: [25, 9]  },
    ],
  },
  {
    combined: 'Matot-Masei',
    singles: ['Matot', 'Masei'],
    aliyot: [
      { num: 1, start: [30, 2],  end: [31, 12] },
      { num: 2, start: [31, 13], end: [31, 54] },
      { num: 3, start: [32, 1],  end: [32, 19] },
      { num: 4, start: [32, 20], end: [33, 49] },
      { num: 5, start: [33, 50], end: [34, 15] },
      { num: 6, start: [34, 16], end: [35, 8]  },
      { num: 7, start: [35, 9],  end: [36, 13] },
    ],
  },
  {
    combined: 'Nitzavim-Vayelech',
    singles: ['Nitzavim', 'Vayelech'],
    aliyot: [
      { num: 1, start: [29, 9],  end: [29, 28] },
      { num: 2, start: [30, 1],  end: [30, 6]  },
      { num: 3, start: [30, 7],  end: [30, 14] },
      { num: 4, start: [30, 15], end: [31, 6]  },
      { num: 5, start: [31, 7],  end: [31, 13] },
      { num: 6, start: [31, 14], end: [31, 19] },
      { num: 7, start: [31, 20], end: [31, 30] },
    ],
  },
];

function inRange(perek, pasuk, start, end) {
  const n = perek * 1000 + pasuk;
  return n >= start[0] * 1000 + start[1] && n <= end[0] * 1000 + end[1];
}

for (const cp of COMBINED_PARSHAS) {
  console.log(`\n=== ${cp.combined} ===`);

  const combinedParsha = await prisma.parsha.findFirst({
    where: { englishName: cp.combined },
    include: { aliyos: { orderBy: { number: 'asc' } } },
  });

  if (!combinedParsha) {
    console.log('  SKIP: not found in DB');
    continue;
  }

  const singleParshas = await prisma.parsha.findMany({
    where: { englishName: { in: cp.singles } },
    include: {
      aliyos: {
        include: {
          pesukim: {
            include: { rashiComments: { orderBy: { sortOrder: 'asc' } } },
            orderBy: [{ perek: 'asc' }, { pasuk: 'asc' }],
          },
        },
      },
    },
  });

  const allPesukim = singleParshas
    .flatMap((p) => p.aliyos.flatMap((a) => a.pesukim))
    .sort((a, b) => (a.perek !== b.perek ? a.perek - b.perek : a.pasuk - b.pasuk));

  if (allPesukim.length === 0) {
    console.log(`  SKIP: no pesukim found for ${cp.singles.join(', ')}`);
    continue;
  }
  console.log(`  Source: ${allPesukim.length} pesukim from ${cp.singles.join(' + ')}`);

  // Clear any previously seeded pesukim (idempotent)
  const existingCount = await prisma.pasuk.count({
    where: { aliyahId: { in: combinedParsha.aliyos.map((a) => a.id) } },
  });
  if (existingCount > 0) {
    await prisma.pasuk.deleteMany({
      where: { aliyahId: { in: combinedParsha.aliyos.map((a) => a.id) } },
    });
    console.log(`  Cleared ${existingCount} existing pesukim`);
  }

  let totalInserted = 0;

  for (const aliyahDef of cp.aliyot) {
    const combinedAliyah = combinedParsha.aliyos.find((a) => a.number === aliyahDef.num);
    if (!combinedAliyah) {
      console.log(`  WARN: aliyah ${aliyahDef.num} not found`);
      continue;
    }

    const matches = allPesukim.filter((p) => inRange(p.perek, p.pasuk, aliyahDef.start, aliyahDef.end));
    console.log(`  Aliyah ${aliyahDef.num} (${aliyahDef.start[0]}:${aliyahDef.start[1]}–${aliyahDef.end[0]}:${aliyahDef.end[1]}): ${matches.length} pesukim`);

    if (matches.length === 0) continue;

    await prisma.$transaction(async (tx) => {
      for (const src of matches) {
        const newPasuk = await tx.pasuk.create({
          data: {
            aliyahId: combinedAliyah.id,
            perek: src.perek,
            pasuk: src.pasuk,
            hebrewText: src.hebrewText,
            targumText: src.targumText,
          },
        });

        if (src.rashiComments.length > 0) {
          await tx.rashiComment.createMany({
            data: src.rashiComments.map((r) => ({
              pasukId: newPasuk.id,
              dibburHamaschil: r.dibburHamaschil,
              text: r.text,
              sortOrder: r.sortOrder,
            })),
          });
        }
      }
    });

    totalInserted += matches.length;
  }

  // Mark as COMBINED
  await prisma.parsha.update({
    where: { id: combinedParsha.id },
    data: { type: 'COMBINED' },
  });

  console.log(`  Total inserted: ${totalInserted} pesukim`);
}

await prisma.$disconnect();
console.log('\nDone.');
