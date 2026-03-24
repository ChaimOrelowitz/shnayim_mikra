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

  // ── Noach (Bereishit 6:9 – 11:32) ───────────────────────────────────────
  await seedParsha('נח', 2, [
    { number: 1, ranges: [{ perek: 6, from: 9, to: 22 }] },
    { number: 2, ranges: [{ perek: 7, from: 1, to: 16 }] },
    { number: 3, ranges: [{ perek: 7, from: 17, to: 24 }, { perek: 8, from: 1, to: 14 }] },
    { number: 4, ranges: [{ perek: 8, from: 15, to: 22 }, { perek: 9, from: 1, to: 7 }] },
    { number: 5, ranges: [{ perek: 9, from: 8, to: 17 }] },
    { number: 6, ranges: [{ perek: 9, from: 18, to: 29 }, { perek: 10, from: 1, to: 32 }] },
    { number: 7, ranges: [{ perek: 11, from: 1, to: 32 }] },
  ]);

  // ── Lech Lecha (Bereishit 12:1 – 17:27) ─────────────────────────────────
  await seedParsha('לך לך', 3, [
    { number: 1, ranges: [{ perek: 12, from: 1, to: 13 }] },
    { number: 2, ranges: [{ perek: 12, from: 14, to: 20 }, { perek: 13, from: 1, to: 18 }] },
    { number: 3, ranges: [{ perek: 14, from: 1, to: 20 }] },
    { number: 4, ranges: [{ perek: 14, from: 21, to: 24 }, { perek: 15, from: 1, to: 21 }] },
    { number: 5, ranges: [{ perek: 16, from: 1, to: 16 }] },
    { number: 6, ranges: [{ perek: 17, from: 1, to: 14 }] },
    { number: 7, ranges: [{ perek: 17, from: 15, to: 27 }] },
  ]);

  // ── Vayeira (Bereishit 18:1 – 22:24) ─────────────────────────────────────
  await seedParsha('וירא', 4, [
    { number: 1, ranges: [{ perek: 18, from: 1, to: 14 }] },
    { number: 2, ranges: [{ perek: 18, from: 15, to: 33 }] },
    { number: 3, ranges: [{ perek: 19, from: 1, to: 20 }] },
    { number: 4, ranges: [{ perek: 19, from: 21, to: 38 }] },
    { number: 5, ranges: [{ perek: 20, from: 1, to: 18 }, { perek: 21, from: 1, to: 21 }] },
    { number: 6, ranges: [{ perek: 21, from: 22, to: 34 }, { perek: 22, from: 1, to: 19 }] },
    { number: 7, ranges: [{ perek: 22, from: 20, to: 24 }] },
  ]);

  // ── Chayei Sara (Bereishit 23:1 – 25:18) ─────────────────────────────────
  await seedParsha('חיי שרה', 5, [
    { number: 1, ranges: [{ perek: 23, from: 1, to: 16 }] },
    { number: 2, ranges: [{ perek: 23, from: 17, to: 20 }, { perek: 24, from: 1, to: 9 }] },
    { number: 3, ranges: [{ perek: 24, from: 10, to: 26 }] },
    { number: 4, ranges: [{ perek: 24, from: 27, to: 52 }] },
    { number: 5, ranges: [{ perek: 24, from: 53, to: 67 }] },
    { number: 6, ranges: [{ perek: 25, from: 1, to: 11 }] },
    { number: 7, ranges: [{ perek: 25, from: 12, to: 18 }] },
  ]);

  // ── Toldot (Bereishit 25:19 – 28:9) ──────────────────────────────────────
  await seedParsha('תולדות', 6, [
    { number: 1, ranges: [{ perek: 25, from: 19, to: 34 }] },
    { number: 2, ranges: [{ perek: 26, from: 1, to: 12 }] },
    { number: 3, ranges: [{ perek: 26, from: 13, to: 22 }] },
    { number: 4, ranges: [{ perek: 26, from: 23, to: 29 }] },
    { number: 5, ranges: [{ perek: 26, from: 30, to: 35 }, { perek: 27, from: 1, to: 27 }] },
    { number: 6, ranges: [{ perek: 27, from: 28, to: 46 }, { perek: 28, from: 1, to: 4 }] },
    { number: 7, ranges: [{ perek: 28, from: 5, to: 9 }] },
  ]);

  // ── Vayetzei (Bereishit 28:10 – 32:3) ────────────────────────────────────
  await seedParsha('ויצא', 7, [
    { number: 1, ranges: [{ perek: 28, from: 10, to: 22 }] },
    { number: 2, ranges: [{ perek: 29, from: 1, to: 17 }] },
    { number: 3, ranges: [{ perek: 29, from: 18, to: 30 }] },
    { number: 4, ranges: [{ perek: 29, from: 31, to: 35 }, { perek: 30, from: 1, to: 21 }] },
    { number: 5, ranges: [{ perek: 30, from: 22, to: 36 }] },
    { number: 6, ranges: [{ perek: 30, from: 37, to: 43 }, { perek: 31, from: 1, to: 16 }] },
    { number: 7, ranges: [{ perek: 31, from: 17, to: 42 }, { perek: 32, from: 1, to: 3 }] },
  ]);

  // ── Vayishlach (Bereishit 32:4 – 36:43) ──────────────────────────────────
  await seedParsha('וישלח', 8, [
    { number: 1, ranges: [{ perek: 32, from: 4, to: 13 }] },
    { number: 2, ranges: [{ perek: 32, from: 14, to: 30 }] },
    { number: 3, ranges: [{ perek: 32, from: 31, to: 33 }, { perek: 33, from: 1, to: 17 }] },
    { number: 4, ranges: [{ perek: 33, from: 18, to: 20 }, { perek: 34, from: 1, to: 31 }] },
    { number: 5, ranges: [{ perek: 35, from: 1, to: 15 }] },
    { number: 6, ranges: [{ perek: 35, from: 16, to: 22 }] },
    { number: 7, ranges: [{ perek: 35, from: 23, to: 29 }, { perek: 36, from: 1, to: 43 }] },
  ]);

  // ── Vayeshev (Bereishit 37:1 – 40:23) ────────────────────────────────────
  await seedParsha('וישב', 9, [
    { number: 1, ranges: [{ perek: 37, from: 1, to: 11 }] },
    { number: 2, ranges: [{ perek: 37, from: 12, to: 22 }] },
    { number: 3, ranges: [{ perek: 37, from: 23, to: 36 }] },
    { number: 4, ranges: [{ perek: 38, from: 1, to: 30 }] },
    { number: 5, ranges: [{ perek: 39, from: 1, to: 6 }] },
    { number: 6, ranges: [{ perek: 39, from: 7, to: 23 }] },
    { number: 7, ranges: [{ perek: 40, from: 1, to: 23 }] },
  ]);

  // ── Miketz (Bereishit 41:1 – 44:17) ──────────────────────────────────────
  await seedParsha('מקץ', 10, [
    { number: 1, ranges: [{ perek: 41, from: 1, to: 14 }] },
    { number: 2, ranges: [{ perek: 41, from: 15, to: 38 }] },
    { number: 3, ranges: [{ perek: 41, from: 39, to: 52 }] },
    { number: 4, ranges: [{ perek: 41, from: 53, to: 57 }, { perek: 42, from: 1, to: 17 }] },
    { number: 5, ranges: [{ perek: 42, from: 18, to: 43 }] },
    { number: 6, ranges: [{ perek: 43, from: 1, to: 29 }] },
    { number: 7, ranges: [{ perek: 43, from: 30, to: 34 }, { perek: 44, from: 1, to: 17 }] },
  ]);

  // ── Vayigash (Bereishit 44:18 – 47:27) ───────────────────────────────────
  await seedParsha('ויגש', 11, [
    { number: 1, ranges: [{ perek: 44, from: 18, to: 30 }] },
    { number: 2, ranges: [{ perek: 44, from: 31, to: 34 }, { perek: 45, from: 1, to: 7 }] },
    { number: 3, ranges: [{ perek: 45, from: 8, to: 18 }] },
    { number: 4, ranges: [{ perek: 45, from: 19, to: 27 }] },
    { number: 5, ranges: [{ perek: 45, from: 28, to: 34 }, { perek: 46, from: 1, to: 27 }] },
    { number: 6, ranges: [{ perek: 46, from: 28, to: 34 }, { perek: 47, from: 1, to: 10 }] },
    { number: 7, ranges: [{ perek: 47, from: 11, to: 27 }] },
  ]);

  // ── Vayechi (Bereishit 47:28 – 50:26) ────────────────────────────────────
  await seedParsha('ויחי', 12, [
    { number: 1, ranges: [{ perek: 47, from: 28, to: 31 }, { perek: 48, from: 1, to: 9 }] },
    { number: 2, ranges: [{ perek: 48, from: 10, to: 16 }] },
    { number: 3, ranges: [{ perek: 48, from: 17, to: 22 }] },
    { number: 4, ranges: [{ perek: 49, from: 1, to: 18 }] },
    { number: 5, ranges: [{ perek: 49, from: 19, to: 26 }] },
    { number: 6, ranges: [{ perek: 49, from: 27, to: 33 }, { perek: 50, from: 1, to: 20 }] },
    { number: 7, ranges: [{ perek: 50, from: 21, to: 26 }] },
  ]);

  // ── Shemot (Shemot 1:1 – 6:1) ────────────────────────────────────────────
  await seedParsha('שמות', 13, [
    { number: 1, ranges: [{ perek: 1, from: 1, to: 17 }] },
    { number: 2, ranges: [{ perek: 1, from: 18, to: 22 }, { perek: 2, from: 1, to: 10 }] },
    { number: 3, ranges: [{ perek: 2, from: 11, to: 25 }] },
    { number: 4, ranges: [{ perek: 3, from: 1, to: 15 }] },
    { number: 5, ranges: [{ perek: 3, from: 16, to: 22 }, { perek: 4, from: 1, to: 17 }] },
    { number: 6, ranges: [{ perek: 4, from: 18, to: 31 }] },
    { number: 7, ranges: [{ perek: 5, from: 1, to: 23 }, { perek: 6, from: 1, to: 1 }] },
  ]);

  // ── Vaera (Shemot 6:2 – 9:35) ────────────────────────────────────────────
  await seedParsha('וארא', 14, [
    { number: 1, ranges: [{ perek: 6, from: 2, to: 13 }] },
    { number: 2, ranges: [{ perek: 6, from: 14, to: 28 }] },
    { number: 3, ranges: [{ perek: 6, from: 29, to: 30 }, { perek: 7, from: 1, to: 7 }] },
    { number: 4, ranges: [{ perek: 7, from: 8, to: 25 }] },
    { number: 5, ranges: [{ perek: 8, from: 1, to: 15 }] },
    { number: 6, ranges: [{ perek: 8, from: 16, to: 28 }] },
    { number: 7, ranges: [{ perek: 9, from: 1, to: 35 }] },
  ]);

  // ── Bo (Shemot 10:1 – 13:16) ─────────────────────────────────────────────
  await seedParsha('בא', 15, [
    { number: 1, ranges: [{ perek: 10, from: 1, to: 11 }] },
    { number: 2, ranges: [{ perek: 10, from: 12, to: 23 }] },
    { number: 3, ranges: [{ perek: 10, from: 24, to: 29 }, { perek: 11, from: 1, to: 3 }] },
    { number: 4, ranges: [{ perek: 11, from: 4, to: 10 }, { perek: 12, from: 1, to: 20 }] },
    { number: 5, ranges: [{ perek: 12, from: 21, to: 36 }] },
    { number: 6, ranges: [{ perek: 12, from: 37, to: 51 }] },
    { number: 7, ranges: [{ perek: 13, from: 1, to: 16 }] },
  ]);

  // ── Beshalach (Shemot 13:17 – 17:16) ─────────────────────────────────────
  await seedParsha('בשלח', 16, [
    { number: 1, ranges: [{ perek: 13, from: 17, to: 22 }, { perek: 14, from: 1, to: 8 }] },
    { number: 2, ranges: [{ perek: 14, from: 9, to: 14 }] },
    { number: 3, ranges: [{ perek: 14, from: 15, to: 25 }] },
    { number: 4, ranges: [{ perek: 14, from: 26, to: 31 }, { perek: 15, from: 1, to: 26 }] },
    { number: 5, ranges: [{ perek: 15, from: 27, to: 27 }, { perek: 16, from: 1, to: 10 }] },
    { number: 6, ranges: [{ perek: 16, from: 11, to: 36 }] },
    { number: 7, ranges: [{ perek: 17, from: 1, to: 16 }] },
  ]);

  // ── Yitro (Shemot 18:1 – 20:23) ──────────────────────────────────────────
  await seedParsha('יתרו', 17, [
    { number: 1, ranges: [{ perek: 18, from: 1, to: 12 }] },
    { number: 2, ranges: [{ perek: 18, from: 13, to: 23 }] },
    { number: 3, ranges: [{ perek: 18, from: 24, to: 27 }, { perek: 19, from: 1, to: 6 }] },
    { number: 4, ranges: [{ perek: 19, from: 7, to: 19 }] },
    { number: 5, ranges: [{ perek: 19, from: 20, to: 25 }, { perek: 20, from: 1, to: 14 }] },
    { number: 6, ranges: [{ perek: 20, from: 15, to: 18 }] },
    { number: 7, ranges: [{ perek: 20, from: 19, to: 23 }] },
  ]);

  // ── Mishpatim (Shemot 21:1 – 24:18) ──────────────────────────────────────
  await seedParsha('משפטים', 18, [
    { number: 1, ranges: [{ perek: 21, from: 1, to: 19 }] },
    { number: 2, ranges: [{ perek: 21, from: 20, to: 37 }] },
    { number: 3, ranges: [{ perek: 22, from: 1, to: 23 }] },
    { number: 4, ranges: [{ perek: 22, from: 24, to: 30 }, { perek: 23, from: 1, to: 19 }] },
    { number: 5, ranges: [{ perek: 23, from: 20, to: 25 }] },
    { number: 6, ranges: [{ perek: 23, from: 26, to: 33 }, { perek: 24, from: 1, to: 11 }] },
    { number: 7, ranges: [{ perek: 24, from: 12, to: 18 }] },
  ]);

  // ── Terumah (Shemot 25:1 – 27:19) ────────────────────────────────────────
  await seedParsha('תרומה', 19, [
    { number: 1, ranges: [{ perek: 25, from: 1, to: 16 }] },
    { number: 2, ranges: [{ perek: 25, from: 17, to: 30 }] },
    { number: 3, ranges: [{ perek: 25, from: 31, to: 40 }] },
    { number: 4, ranges: [{ perek: 26, from: 1, to: 14 }] },
    { number: 5, ranges: [{ perek: 26, from: 15, to: 30 }] },
    { number: 6, ranges: [{ perek: 26, from: 31, to: 37 }, { perek: 27, from: 1, to: 8 }] },
    { number: 7, ranges: [{ perek: 27, from: 9, to: 19 }] },
  ]);

  // ── Tetzaveh (Shemot 27:20 – 30:10) ──────────────────────────────────────
  await seedParsha('תצוה', 20, [
    { number: 1, ranges: [{ perek: 27, from: 20, to: 21 }, { perek: 28, from: 1, to: 12 }] },
    { number: 2, ranges: [{ perek: 28, from: 13, to: 30 }] },
    { number: 3, ranges: [{ perek: 28, from: 31, to: 43 }] },
    { number: 4, ranges: [{ perek: 29, from: 1, to: 18 }] },
    { number: 5, ranges: [{ perek: 29, from: 19, to: 37 }] },
    { number: 6, ranges: [{ perek: 29, from: 38, to: 46 }] },
    { number: 7, ranges: [{ perek: 30, from: 1, to: 10 }] },
  ]);

  // ── Ki Tisa (Shemot 30:11 – 34:35) ───────────────────────────────────────
  await seedParsha('כי תשא', 21, [
    { number: 1, ranges: [{ perek: 30, from: 11, to: 31 }] },
    { number: 2, ranges: [{ perek: 30, from: 32, to: 38 }, { perek: 31, from: 1, to: 17 }] },
    { number: 3, ranges: [{ perek: 31, from: 18, to: 18 }, { perek: 32, from: 1, to: 6 }] },
    { number: 4, ranges: [{ perek: 32, from: 7, to: 29 }] },
    { number: 5, ranges: [{ perek: 32, from: 30, to: 35 }, { perek: 33, from: 1, to: 16 }] },
    { number: 6, ranges: [{ perek: 33, from: 17, to: 23 }, { perek: 34, from: 1, to: 9 }] },
    { number: 7, ranges: [{ perek: 34, from: 10, to: 35 }] },
  ]);

  // ── Vayakhel (Shemot 35:1 – 38:20) ───────────────────────────────────────
  await seedParsha('ויקהל', 22, [
    { number: 1, ranges: [{ perek: 35, from: 1, to: 20 }] },
    { number: 2, ranges: [{ perek: 35, from: 21, to: 29 }] },
    { number: 3, ranges: [{ perek: 35, from: 30, to: 35 }, { perek: 36, from: 1, to: 7 }] },
    { number: 4, ranges: [{ perek: 36, from: 8, to: 19 }] },
    { number: 5, ranges: [{ perek: 36, from: 20, to: 38 }] },
    { number: 6, ranges: [{ perek: 37, from: 1, to: 16 }] },
    { number: 7, ranges: [{ perek: 37, from: 17, to: 29 }, { perek: 38, from: 1, to: 20 }] },
  ]);

  // ── Pekudei (Shemot 38:21 – 40:38) ───────────────────────────────────────
  await seedParsha('פקודי', 23, [
    { number: 1, ranges: [{ perek: 38, from: 21, to: 31 }] },
    { number: 2, ranges: [{ perek: 39, from: 1, to: 21 }] },
    { number: 3, ranges: [{ perek: 39, from: 22, to: 32 }] },
    { number: 4, ranges: [{ perek: 39, from: 33, to: 43 }] },
    { number: 5, ranges: [{ perek: 40, from: 1, to: 16 }] },
    { number: 6, ranges: [{ perek: 40, from: 17, to: 27 }] },
    { number: 7, ranges: [{ perek: 40, from: 28, to: 38 }] },
  ]);

  // ── Vayikra (Vayikra 1:1 – 5:26) ──────────────────────────────────────────
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

  // ── Shemini (Vayikra 9:1 – 11:47) ────────────────────────────────────────
  await seedParsha('שמיני', 26, [
    { number: 1, ranges: [{ perek: 9, from: 1, to: 16 }] },
    { number: 2, ranges: [{ perek: 9, from: 17, to: 23 }] },
    { number: 3, ranges: [{ perek: 9, from: 24, to: 24 }, { perek: 10, from: 1, to: 11 }] },
    { number: 4, ranges: [{ perek: 10, from: 12, to: 15 }] },
    { number: 5, ranges: [{ perek: 10, from: 16, to: 20 }] },
    { number: 6, ranges: [{ perek: 11, from: 1, to: 32 }] },
    { number: 7, ranges: [{ perek: 11, from: 33, to: 47 }] },
  ]);

  // ── Tazria (Vayikra 12:1 – 13:59) ────────────────────────────────────────
  await seedParsha('תזריע', 27, [
    { number: 1, ranges: [{ perek: 12, from: 1, to: 8 }] },
    { number: 2, ranges: [{ perek: 13, from: 1, to: 17 }] },
    { number: 3, ranges: [{ perek: 13, from: 18, to: 23 }] },
    { number: 4, ranges: [{ perek: 13, from: 24, to: 28 }] },
    { number: 5, ranges: [{ perek: 13, from: 29, to: 37 }] },
    { number: 6, ranges: [{ perek: 13, from: 38, to: 54 }] },
    { number: 7, ranges: [{ perek: 13, from: 55, to: 59 }] },
  ]);

  // ── Metzora (Vayikra 14:1 – 15:33) ───────────────────────────────────────
  await seedParsha('מצורע', 28, [
    { number: 1, ranges: [{ perek: 14, from: 1, to: 12 }] },
    { number: 2, ranges: [{ perek: 14, from: 13, to: 20 }] },
    { number: 3, ranges: [{ perek: 14, from: 21, to: 32 }] },
    { number: 4, ranges: [{ perek: 14, from: 33, to: 53 }] },
    { number: 5, ranges: [{ perek: 14, from: 54, to: 57 }] },
    { number: 6, ranges: [{ perek: 15, from: 1, to: 15 }] },
    { number: 7, ranges: [{ perek: 15, from: 16, to: 33 }] },
  ]);

  // ── Acharei Mot (Vayikra 16:1 – 18:30) ───────────────────────────────────
  await seedParsha('אחרי מות', 29, [
    { number: 1, ranges: [{ perek: 16, from: 1, to: 17 }] },
    { number: 2, ranges: [{ perek: 16, from: 18, to: 24 }] },
    { number: 3, ranges: [{ perek: 16, from: 25, to: 34 }] },
    { number: 4, ranges: [{ perek: 17, from: 1, to: 7 }] },
    { number: 5, ranges: [{ perek: 17, from: 8, to: 16 }, { perek: 18, from: 1, to: 5 }] },
    { number: 6, ranges: [{ perek: 18, from: 6, to: 21 }] },
    { number: 7, ranges: [{ perek: 18, from: 22, to: 30 }] },
  ]);

  // ── Kedoshim (Vayikra 19:1 – 20:27) ──────────────────────────────────────
  await seedParsha('קדושים', 30, [
    { number: 1, ranges: [{ perek: 19, from: 1, to: 14 }] },
    { number: 2, ranges: [{ perek: 19, from: 15, to: 22 }] },
    { number: 3, ranges: [{ perek: 19, from: 23, to: 32 }] },
    { number: 4, ranges: [{ perek: 19, from: 33, to: 37 }] },
    { number: 5, ranges: [{ perek: 20, from: 1, to: 7 }] },
    { number: 6, ranges: [{ perek: 20, from: 8, to: 22 }] },
    { number: 7, ranges: [{ perek: 20, from: 23, to: 27 }] },
  ]);

  // ── Emor (Vayikra 21:1 – 24:23) ──────────────────────────────────────────
  await seedParsha('אמור', 31, [
    { number: 1, ranges: [{ perek: 21, from: 1, to: 15 }] },
    { number: 2, ranges: [{ perek: 21, from: 16, to: 24 }, { perek: 22, from: 1, to: 16 }] },
    { number: 3, ranges: [{ perek: 22, from: 17, to: 33 }] },
    { number: 4, ranges: [{ perek: 23, from: 1, to: 22 }] },
    { number: 5, ranges: [{ perek: 23, from: 23, to: 32 }] },
    { number: 6, ranges: [{ perek: 23, from: 33, to: 44 }] },
    { number: 7, ranges: [{ perek: 24, from: 1, to: 23 }] },
  ]);

  // ── Behar (Vayikra 25:1 – 26:2) ──────────────────────────────────────────
  await seedParsha('בהר', 32, [
    { number: 1, ranges: [{ perek: 25, from: 1, to: 13 }] },
    { number: 2, ranges: [{ perek: 25, from: 14, to: 18 }] },
    { number: 3, ranges: [{ perek: 25, from: 19, to: 24 }] },
    { number: 4, ranges: [{ perek: 25, from: 25, to: 28 }] },
    { number: 5, ranges: [{ perek: 25, from: 29, to: 38 }] },
    { number: 6, ranges: [{ perek: 25, from: 39, to: 46 }] },
    { number: 7, ranges: [{ perek: 25, from: 47, to: 55 }, { perek: 26, from: 1, to: 2 }] },
  ]);

  // ── Bechukotai (Vayikra 26:3 – 27:34) ────────────────────────────────────
  await seedParsha('בחוקותי', 33, [
    { number: 1, ranges: [{ perek: 26, from: 3, to: 5 }] },
    { number: 2, ranges: [{ perek: 26, from: 6, to: 9 }] },
    { number: 3, ranges: [{ perek: 26, from: 10, to: 46 }] },
    { number: 4, ranges: [{ perek: 27, from: 1, to: 15 }] },
    { number: 5, ranges: [{ perek: 27, from: 16, to: 21 }] },
    { number: 6, ranges: [{ perek: 27, from: 22, to: 28 }] },
    { number: 7, ranges: [{ perek: 27, from: 29, to: 34 }] },
  ]);

  // ── Bamidbar (Bamidbar 1:1 – 4:20) ───────────────────────────────────────
  await seedParsha('במדבר', 34, [
    { number: 1, ranges: [{ perek: 1, from: 1, to: 19 }] },
    { number: 2, ranges: [{ perek: 1, from: 20, to: 54 }] },
    { number: 3, ranges: [{ perek: 2, from: 1, to: 34 }] },
    { number: 4, ranges: [{ perek: 3, from: 1, to: 13 }] },
    { number: 5, ranges: [{ perek: 3, from: 14, to: 39 }] },
    { number: 6, ranges: [{ perek: 3, from: 40, to: 51 }] },
    { number: 7, ranges: [{ perek: 4, from: 1, to: 20 }] },
  ]);

  // ── Nasso (Bamidbar 4:21 – 7:89) ─────────────────────────────────────────
  await seedParsha('נשא', 35, [
    { number: 1, ranges: [{ perek: 4, from: 21, to: 37 }] },
    { number: 2, ranges: [{ perek: 4, from: 38, to: 49 }] },
    { number: 3, ranges: [{ perek: 5, from: 1, to: 10 }] },
    { number: 4, ranges: [{ perek: 5, from: 11, to: 31 }] },
    { number: 5, ranges: [{ perek: 6, from: 1, to: 21 }] },
    { number: 6, ranges: [{ perek: 6, from: 22, to: 27 }, { perek: 7, from: 1, to: 41 }] },
    { number: 7, ranges: [{ perek: 7, from: 42, to: 89 }] },
  ]);

  // ── Behaalotecha (Bamidbar 8:1 – 12:16) ──────────────────────────────────
  await seedParsha('בהעלותך', 36, [
    { number: 1, ranges: [{ perek: 8, from: 1, to: 14 }] },
    { number: 2, ranges: [{ perek: 8, from: 15, to: 26 }] },
    { number: 3, ranges: [{ perek: 9, from: 1, to: 14 }] },
    { number: 4, ranges: [{ perek: 9, from: 15, to: 23 }, { perek: 10, from: 1, to: 10 }] },
    { number: 5, ranges: [{ perek: 10, from: 11, to: 34 }] },
    { number: 6, ranges: [{ perek: 10, from: 35, to: 36 }, { perek: 11, from: 1, to: 29 }] },
    { number: 7, ranges: [{ perek: 11, from: 30, to: 35 }, { perek: 12, from: 1, to: 16 }] },
  ]);

  // ── Shelach (Bamidbar 13:1 – 15:41) ──────────────────────────────────────
  await seedParsha('שלח', 37, [
    { number: 1, ranges: [{ perek: 13, from: 1, to: 20 }] },
    { number: 2, ranges: [{ perek: 13, from: 21, to: 33 }, { perek: 14, from: 1, to: 7 }] },
    { number: 3, ranges: [{ perek: 14, from: 8, to: 25 }] },
    { number: 4, ranges: [{ perek: 14, from: 26, to: 45 }] },
    { number: 5, ranges: [{ perek: 15, from: 1, to: 16 }] },
    { number: 6, ranges: [{ perek: 15, from: 17, to: 26 }] },
    { number: 7, ranges: [{ perek: 15, from: 27, to: 41 }] },
  ]);

  // ── Korach (Bamidbar 16:1 – 18:32) ───────────────────────────────────────
  await seedParsha('קרח', 38, [
    { number: 1, ranges: [{ perek: 16, from: 1, to: 13 }] },
    { number: 2, ranges: [{ perek: 16, from: 14, to: 19 }] },
    { number: 3, ranges: [{ perek: 16, from: 20, to: 35 }, { perek: 17, from: 1, to: 8 }] },
    { number: 4, ranges: [{ perek: 17, from: 9, to: 15 }] },
    { number: 5, ranges: [{ perek: 17, from: 16, to: 24 }] },
    { number: 6, ranges: [{ perek: 17, from: 25, to: 28 }, { perek: 18, from: 1, to: 20 }] },
    { number: 7, ranges: [{ perek: 18, from: 21, to: 32 }] },
  ]);

  // ── Chukat (Bamidbar 19:1 – 22:1) ────────────────────────────────────────
  await seedParsha('חקת', 39, [
    { number: 1, ranges: [{ perek: 19, from: 1, to: 17 }] },
    { number: 2, ranges: [{ perek: 19, from: 18, to: 22 }, { perek: 20, from: 1, to: 6 }] },
    { number: 3, ranges: [{ perek: 20, from: 7, to: 13 }] },
    { number: 4, ranges: [{ perek: 20, from: 14, to: 21 }] },
    { number: 5, ranges: [{ perek: 20, from: 22, to: 29 }, { perek: 21, from: 1, to: 9 }] },
    { number: 6, ranges: [{ perek: 21, from: 10, to: 20 }] },
    { number: 7, ranges: [{ perek: 21, from: 21, to: 35 }, { perek: 22, from: 1, to: 1 }] },
  ]);

  // ── Balak (Bamidbar 22:2 – 25:9) ─────────────────────────────────────────
  await seedParsha('בלק', 40, [
    { number: 1, ranges: [{ perek: 22, from: 2, to: 12 }] },
    { number: 2, ranges: [{ perek: 22, from: 13, to: 20 }] },
    { number: 3, ranges: [{ perek: 22, from: 21, to: 38 }] },
    { number: 4, ranges: [{ perek: 22, from: 39, to: 41 }, { perek: 23, from: 1, to: 12 }] },
    { number: 5, ranges: [{ perek: 23, from: 13, to: 26 }] },
    { number: 6, ranges: [{ perek: 23, from: 27, to: 30 }, { perek: 24, from: 1, to: 13 }] },
    { number: 7, ranges: [{ perek: 24, from: 14, to: 25 }, { perek: 25, from: 1, to: 9 }] },
  ]);

  // ── Pinchas (Bamidbar 25:10 – 30:1) ──────────────────────────────────────
  await seedParsha('פינחס', 41, [
    { number: 1, ranges: [{ perek: 25, from: 10, to: 29 }, { perek: 26, from: 1, to: 4 }] },
    { number: 2, ranges: [{ perek: 26, from: 5, to: 51 }] },
    { number: 3, ranges: [{ perek: 26, from: 52, to: 65 }, { perek: 27, from: 1, to: 5 }] },
    { number: 4, ranges: [{ perek: 27, from: 6, to: 23 }] },
    { number: 5, ranges: [{ perek: 28, from: 1, to: 15 }] },
    { number: 6, ranges: [{ perek: 28, from: 16, to: 31 }, { perek: 29, from: 1, to: 11 }] },
    { number: 7, ranges: [{ perek: 29, from: 12, to: 40 }, { perek: 30, from: 1, to: 1 }] },
  ]);

  // ── Matot (Bamidbar 30:2 – 32:42) ────────────────────────────────────────
  await seedParsha('מטות', 42, [
    { number: 1, ranges: [{ perek: 30, from: 2, to: 17 }] },
    { number: 2, ranges: [{ perek: 31, from: 1, to: 12 }] },
    { number: 3, ranges: [{ perek: 31, from: 13, to: 24 }] },
    { number: 4, ranges: [{ perek: 31, from: 25, to: 54 }] },
    { number: 5, ranges: [{ perek: 32, from: 1, to: 19 }] },
    { number: 6, ranges: [{ perek: 32, from: 20, to: 33 }] },
    { number: 7, ranges: [{ perek: 32, from: 34, to: 42 }] },
  ]);

  // ── Masei (Bamidbar 33:1 – 36:13) ────────────────────────────────────────
  await seedParsha('מסעי', 43, [
    { number: 1, ranges: [{ perek: 33, from: 1, to: 10 }] },
    { number: 2, ranges: [{ perek: 33, from: 11, to: 49 }] },
    { number: 3, ranges: [{ perek: 33, from: 50, to: 56 }, { perek: 34, from: 1, to: 15 }] },
    { number: 4, ranges: [{ perek: 34, from: 16, to: 29 }] },
    { number: 5, ranges: [{ perek: 35, from: 1, to: 8 }] },
    { number: 6, ranges: [{ perek: 35, from: 9, to: 34 }] },
    { number: 7, ranges: [{ perek: 36, from: 1, to: 13 }] },
  ]);

  // ── Devarim (Devarim 1:1 – 3:22) ─────────────────────────────────────────
  await seedParsha('דברים', 44, [
    { number: 1, ranges: [{ perek: 1, from: 1, to: 10 }] },
    { number: 2, ranges: [{ perek: 1, from: 11, to: 21 }] },
    { number: 3, ranges: [{ perek: 1, from: 22, to: 38 }] },
    { number: 4, ranges: [{ perek: 1, from: 39, to: 46 }, { perek: 2, from: 1, to: 1 }] },
    { number: 5, ranges: [{ perek: 2, from: 2, to: 30 }] },
    { number: 6, ranges: [{ perek: 2, from: 31, to: 37 }, { perek: 3, from: 1, to: 14 }] },
    { number: 7, ranges: [{ perek: 3, from: 15, to: 22 }] },
  ]);

  // ── Vaetchanan (Devarim 3:23 – 7:11) ─────────────────────────────────────
  await seedParsha('ואתחנן', 45, [
    { number: 1, ranges: [{ perek: 3, from: 23, to: 25 }, { perek: 4, from: 1, to: 4 }] },
    { number: 2, ranges: [{ perek: 4, from: 5, to: 40 }] },
    { number: 3, ranges: [{ perek: 4, from: 41, to: 49 }] },
    { number: 4, ranges: [{ perek: 5, from: 1, to: 18 }] },
    { number: 5, ranges: [{ perek: 5, from: 19, to: 30 }, { perek: 6, from: 1, to: 3 }] },
    { number: 6, ranges: [{ perek: 6, from: 4, to: 25 }] },
    { number: 7, ranges: [{ perek: 7, from: 1, to: 11 }] },
  ]);

  // ── Eikev (Devarim 7:12 – 11:25) ─────────────────────────────────────────
  await seedParsha('עקב', 46, [
    { number: 1, ranges: [{ perek: 7, from: 12, to: 21 }] },
    { number: 2, ranges: [{ perek: 7, from: 22, to: 26 }, { perek: 8, from: 1, to: 10 }] },
    { number: 3, ranges: [{ perek: 8, from: 11, to: 20 }, { perek: 9, from: 1, to: 3 }] },
    { number: 4, ranges: [{ perek: 9, from: 4, to: 29 }] },
    { number: 5, ranges: [{ perek: 10, from: 1, to: 11 }] },
    { number: 6, ranges: [{ perek: 10, from: 12, to: 22 }, { perek: 11, from: 1, to: 9 }] },
    { number: 7, ranges: [{ perek: 11, from: 10, to: 25 }] },
  ]);

  // ── Re'eh (Devarim 11:26 – 16:17) ────────────────────────────────────────
  await seedParsha('ראה', 47, [
    { number: 1, ranges: [{ perek: 11, from: 26, to: 32 }, { perek: 12, from: 1, to: 10 }] },
    { number: 2, ranges: [{ perek: 12, from: 11, to: 28 }] },
    { number: 3, ranges: [{ perek: 12, from: 29, to: 31 }, { perek: 13, from: 1, to: 19 }] },
    { number: 4, ranges: [{ perek: 14, from: 1, to: 21 }] },
    { number: 5, ranges: [{ perek: 14, from: 22, to: 29 }] },
    { number: 6, ranges: [{ perek: 15, from: 1, to: 18 }] },
    { number: 7, ranges: [{ perek: 15, from: 19, to: 23 }, { perek: 16, from: 1, to: 17 }] },
  ]);

  // ── Shoftim (Devarim 16:18 – 21:9) ───────────────────────────────────────
  await seedParsha('שופטים', 48, [
    { number: 1, ranges: [{ perek: 16, from: 18, to: 20 }, { perek: 17, from: 1, to: 13 }] },
    { number: 2, ranges: [{ perek: 17, from: 14, to: 20 }] },
    { number: 3, ranges: [{ perek: 18, from: 1, to: 5 }] },
    { number: 4, ranges: [{ perek: 18, from: 6, to: 13 }] },
    { number: 5, ranges: [{ perek: 18, from: 14, to: 22 }, { perek: 19, from: 1, to: 13 }] },
    { number: 6, ranges: [{ perek: 19, from: 14, to: 21 }, { perek: 20, from: 1, to: 9 }] },
    { number: 7, ranges: [{ perek: 20, from: 10, to: 20 }, { perek: 21, from: 1, to: 9 }] },
  ]);

  // ── Ki Teitzei (Devarim 21:10 – 25:19) ───────────────────────────────────
  await seedParsha('כי תצא', 49, [
    { number: 1, ranges: [{ perek: 21, from: 10, to: 21 }] },
    { number: 2, ranges: [{ perek: 21, from: 22, to: 23 }, { perek: 22, from: 1, to: 7 }] },
    { number: 3, ranges: [{ perek: 22, from: 8, to: 29 }, { perek: 23, from: 1, to: 7 }] },
    { number: 4, ranges: [{ perek: 23, from: 8, to: 25 }] },
    { number: 5, ranges: [{ perek: 24, from: 1, to: 4 }] },
    { number: 6, ranges: [{ perek: 24, from: 5, to: 13 }] },
    { number: 7, ranges: [{ perek: 24, from: 14, to: 22 }, { perek: 25, from: 1, to: 19 }] },
  ]);

  // ── Ki Tavo (Devarim 26:1 – 29:8) ────────────────────────────────────────
  await seedParsha('כי תבוא', 50, [
    { number: 1, ranges: [{ perek: 26, from: 1, to: 11 }] },
    { number: 2, ranges: [{ perek: 26, from: 12, to: 15 }] },
    { number: 3, ranges: [{ perek: 26, from: 16, to: 19 }, { perek: 27, from: 1, to: 10 }] },
    { number: 4, ranges: [{ perek: 27, from: 11, to: 26 }, { perek: 28, from: 1, to: 6 }] },
    { number: 5, ranges: [{ perek: 28, from: 7, to: 69 }] },
    { number: 6, ranges: [{ perek: 29, from: 1, to: 8 }] },
    { number: 7, ranges: [{ perek: 29, from: 1, to: 8 }] },
  ]);

  // ── Nitzavim (Devarim 29:9 – 30:20) ──────────────────────────────────────
  await seedParsha('נצבים', 51, [
    { number: 1, ranges: [{ perek: 29, from: 9, to: 11 }] },
    { number: 2, ranges: [{ perek: 29, from: 12, to: 14 }] },
    { number: 3, ranges: [{ perek: 29, from: 15, to: 28 }] },
    { number: 4, ranges: [{ perek: 30, from: 1, to: 6 }] },
    { number: 5, ranges: [{ perek: 30, from: 7, to: 10 }] },
    { number: 6, ranges: [{ perek: 30, from: 11, to: 14 }] },
    { number: 7, ranges: [{ perek: 30, from: 15, to: 20 }] },
  ]);

  // ── Vayeilech (Devarim 31:1 – 31:30) ─────────────────────────────────────
  await seedParsha('וילך', 52, [
    { number: 1, ranges: [{ perek: 31, from: 1, to: 3 }] },
    { number: 2, ranges: [{ perek: 31, from: 4, to: 6 }] },
    { number: 3, ranges: [{ perek: 31, from: 7, to: 9 }] },
    { number: 4, ranges: [{ perek: 31, from: 10, to: 13 }] },
    { number: 5, ranges: [{ perek: 31, from: 14, to: 19 }] },
    { number: 6, ranges: [{ perek: 31, from: 20, to: 24 }] },
    { number: 7, ranges: [{ perek: 31, from: 25, to: 30 }] },
  ]);

  // ── Haazinu (Devarim 32:1 – 32:52) ───────────────────────────────────────
  await seedParsha('האזינו', 53, [
    { number: 1, ranges: [{ perek: 32, from: 1, to: 6 }] },
    { number: 2, ranges: [{ perek: 32, from: 7, to: 12 }] },
    { number: 3, ranges: [{ perek: 32, from: 13, to: 18 }] },
    { number: 4, ranges: [{ perek: 32, from: 19, to: 28 }] },
    { number: 5, ranges: [{ perek: 32, from: 29, to: 39 }] },
    { number: 6, ranges: [{ perek: 32, from: 40, to: 43 }] },
    { number: 7, ranges: [{ perek: 32, from: 44, to: 52 }] },
  ]);

  // ── Vezot Habracha (Devarim 33:1 – 34:12) ────────────────────────────────
  await seedParsha('וזאת הברכה', 54, [
    { number: 1, ranges: [{ perek: 33, from: 1, to: 7 }] },
    { number: 2, ranges: [{ perek: 33, from: 8, to: 12 }] },
    { number: 3, ranges: [{ perek: 33, from: 13, to: 17 }] },
    { number: 4, ranges: [{ perek: 33, from: 18, to: 21 }] },
    { number: 5, ranges: [{ perek: 33, from: 22, to: 26 }] },
    { number: 6, ranges: [{ perek: 33, from: 27, to: 29 }] },
    { number: 7, ranges: [{ perek: 34, from: 1, to: 12 }] },
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
