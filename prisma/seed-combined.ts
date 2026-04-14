import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMBINED: { name: string; englishName: string; order: number }[] = [
  { name: 'ויקהל-פקודי',    englishName: 'Vayakhel-Pekudei',       order: 22.5 },
  { name: 'תזריע-מצורע',    englishName: 'Tazria-Metzora',          order: 27.5 },
  { name: 'אחרי מות-קדושים', englishName: 'Acharei Mot-Kedoshim',   order: 29.5 },
  { name: 'בהר-בחוקותי',    englishName: 'Behar-Bechukotai',        order: 32.5 },
  { name: 'חקת-בלק',        englishName: 'Chukat-Balak',            order: 39.5 },
  { name: 'מטות-מסעי',      englishName: 'Matot-Masei',             order: 42.5 },
  { name: 'נצבים-וילך',     englishName: 'Nitzavim-Vayelech',       order: 51.5 },
];

async function main() {
  // Move Tazria-Metzora from old order 101 if it exists
  const old = await prisma.parsha.findFirst({ where: { order: 101 } });
  if (old) {
    await prisma.parsha.update({ where: { id: old.id }, data: { order: 27.5 } });
    console.log('✅ Moved Tazria-Metzora from order 101 → 27.5');
  }

  for (const { name, englishName, order } of COMBINED) {
    const existing = await prisma.parsha.findFirst({ where: { order } });
    if (existing) {
      console.log(`⏭️  Skipping ${englishName} (already at order ${order})`);
      continue;
    }

    await prisma.parsha.create({
      data: {
        name,
        englishName,
        order,
        aliyos: {
          create: [1, 2, 3, 4, 5, 6, 7].map(n => ({ number: n })),
        },
      },
    });
    console.log(`✅ Added ${englishName} (order ${order})`);
  }
}

main().finally(() => prisma.$disconnect());
