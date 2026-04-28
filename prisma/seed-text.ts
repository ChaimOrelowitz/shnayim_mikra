/**
 * Fetches Hebrew text, Targum Onkelos, and Rashi from Sefaria
 * and populates the hebrewText, targumText, and RashiComment fields
 * for all Pasuk records already in the database.
 *
 * Run with:
 *   npx dotenv-cli -e .env.local -- npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-text.ts
 *
 * Pass --parsha=<englishName> to seed only one parsha, e.g.:
 *   ... seed-text.ts --parsha=Bereishit
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Sefer mapping ────────────────────────────────────────────────────────────

type SeferName = 'Genesis' | 'Exodus' | 'Leviticus' | 'Numbers' | 'Deuteronomy';

function seferForOrder(order: number): SeferName {
  if (order <= 12) return 'Genesis';
  if (order <= 23) return 'Exodus';
  if (order <= 33) return 'Leviticus';
  if (order <= 43) return 'Numbers';
  return 'Deuteronomy';
}

// Targum Onkelos book names in Sefaria differ slightly
const ONKELOS_NAME: Record<SeferName, string> = {
  Genesis: 'Onkelos_Genesis',
  Exodus: 'Onkelos_Exodus',
  Leviticus: 'Onkelos_Leviticus',
  Numbers: 'Onkelos_Numbers',
  Deuteronomy: 'Onkelos_Deuteronomy',
};

const RASHI_NAME: Record<SeferName, string> = {
  Genesis: 'Rashi_on_Genesis',
  Exodus: 'Rashi_on_Exodus',
  Leviticus: 'Rashi_on_Leviticus',
  Numbers: 'Rashi_on_Numbers',
  Deuteronomy: 'Rashi_on_Deuteronomy',
};

// ── HTML stripping ───────────────────────────────────────────────────────────

function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, '')       // remove all HTML tags
    .replace(/&thinsp;/g, ' ') // thin space
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Rashi: extract <b>dibur hamaschil</b> + rest of text
function parseRashiComment(raw: string): { dibburHamaschil: string | null; text: string } {
  const match = raw.match(/^<b>(.+?)<\/b>\.?\s*([\s\S]*)$/);
  if (match) {
    return {
      dibburHamaschil: stripHtml(match[1]).replace(/\.$/, '').trim() || null,
      text: stripHtml(match[2]).trim(),
    };
  }
  return { dibburHamaschil: null, text: stripHtml(raw) };
}

// ── Sefaria fetch helpers ────────────────────────────────────────────────────

const SEFARIA = 'https://www.sefaria.org/api/texts';

async function fetchChapter(ref: string): Promise<string[]> {
  const url = `${SEFARIA}/${encodeURIComponent(ref)}?lang=he`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sefaria ${res.status} for ${ref}`);
  const data = await res.json() as { he: string[] | string[][] };
  // Some endpoints return nested arrays (e.g. Rashi); this helper is for flat ones
  return (data.he as string[]).map(v => (typeof v === 'string' ? v : ''));
}

async function fetchRashiChapter(sefer: SeferName, perek: number): Promise<string[][]> {
  // Requesting a verse range forces Sefaria to return nested arrays (verse → comments).
  // A plain chapter request returns a flat list without verse grouping.
  const ref = `${RASHI_NAME[sefer]}.${perek}.1-999`;
  const url = `${SEFARIA}/${encodeURIComponent(ref)}?lang=he`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  ⚠  Rashi not found for ${RASHI_NAME[sefer]}.${perek} (${res.status})`);
    return [];
  }
  const data = await res.json() as { he: (string | string[])[] };
  return data.he.map(v => (Array.isArray(v) ? v : []));
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const parshaFilter = process.argv.find(a => a.startsWith('--parsha='))?.split('=')[1];

  // Load all pesukim with their parsha info
  const pesukim = await prisma.pasuk.findMany({
    include: { aliyah: { include: { parsha: true } } },
    where: parshaFilter
      ? { aliyah: { parsha: { englishName: parshaFilter } } }
      : undefined,
    orderBy: [
      { aliyah: { parsha: { order: 'asc' } } },
      { perek: 'asc' },
      { pasuk: 'asc' },
    ],
  });

  if (pesukim.length === 0) {
    console.log('No pesukim found. Run the main seed first.');
    return;
  }

  // Group by (sefer, perek) — fetch each chapter once
  type ChapterKey = string; // "Genesis.1"
  const byChapter = new Map<ChapterKey, typeof pesukim>();

  for (const p of pesukim) {
    const sefer = seferForOrder(p.aliyah.parsha.order);
    const key: ChapterKey = `${sefer}.${p.perek}`;
    if (!byChapter.has(key)) byChapter.set(key, []);
    byChapter.get(key)!.push(p);
  }

  const chapters = [...byChapter.keys()];
  console.log(`\n📖 Seeding text for ${pesukim.length} pesukim across ${chapters.length} chapters…\n`);

  let done = 0;

  for (const key of chapters) {
    const [sefer, perekStr] = key.split('.') as [SeferName, string];
    const perek = parseInt(perekStr, 10);
    const pasukList = byChapter.get(key)!;

    process.stdout.write(`  ${key.padEnd(22)}`);

    // Fetch all three sources in parallel
    const [hebrewVerse, targumVerse, rashiVerse] = await Promise.all([
      fetchChapter(`${sefer}.${perek}`).catch(() => [] as string[]),
      fetchChapter(`${ONKELOS_NAME[sefer]}.${perek}`).catch(() => [] as string[]),
      fetchRashiChapter(sefer, perek).catch(() => [] as string[][]),
    ]);

    // Update each pasuk in this chapter
    const updates: Promise<unknown>[] = [];

    for (const p of pasukList) {
      const idx = p.pasuk - 1; // Sefaria is 1-indexed, array is 0-indexed

      const hebrewText = stripHtml(hebrewVerse[idx] ?? '');
      const targumText = targumVerse[idx] ? stripHtml(targumVerse[idx]) : null;
      const rashiComments = rashiVerse[idx] ?? [];

      updates.push(
        prisma.pasuk.update({
          where: { id: p.id },
          data: { hebrewText, targumText },
        })
      );

      if (rashiComments.length > 0) {
        // Delete stale Rashi comments first, then recreate
        updates.push(
          prisma.rashiComment.deleteMany({ where: { pasukId: p.id } }).then(() =>
            prisma.rashiComment.createMany({
              data: rashiComments.map((raw, i) => {
                const { dibburHamaschil, text } = parseRashiComment(raw);
                return { pasukId: p.id, sortOrder: i, dibburHamaschil, text };
              }),
            })
          )
        );
      }
    }

    await Promise.all(updates);
    done += pasukList.length;

    const rashiCount = pasukList.reduce((s, p) => {
      const idx = p.pasuk - 1;
      return s + (rashiVerse[idx]?.length ?? 0);
    }, 0);

    console.log(`✓  ${pasukList.length} pesukim, ${rashiCount} Rashi`);

    // Polite delay — Sefaria asks for reasonable usage
    await sleep(250);
  }

  console.log(`\n✅ Done — ${done} pesukim seeded.\n`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
