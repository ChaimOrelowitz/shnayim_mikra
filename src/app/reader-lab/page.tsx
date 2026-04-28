import { prisma } from '@/lib/prisma';
import { ReaderLabClient } from './ReaderLabClient';

export const dynamic = 'force-dynamic';

export default async function ReaderLabPage() {
  // Fetch Bereishit Aliyah 1 from DB
  const aliyah = await prisma.aliyah.findFirst({
    where: {
      number: 1,
      parsha: { englishName: 'Bereishit' },
    },
    include: {
      parsha: true,
      pesukim: {
        orderBy: [{ perek: 'asc' }, { pasuk: 'asc' }],
        include: {
          rashiComments: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  });

  if (!aliyah) {
    return (
      <main className="min-h-screen bg-parchment-50 flex items-center justify-center">
        <p className="text-ink-500">No data found — run the seed script first.</p>
      </main>
    );
  }

  // Shape into the VerseItem format the reader components expect
  const verses = aliyah.pesukim.map((p) => ({
    id: p.id,
    ref: `Genesis ${p.perek}:${p.pasuk}`,
    hebrewRef: `${toHebNum(p.perek)}:${toHebNum(p.pasuk)}`,
    mikra: p.hebrewText,
    targum: p.targumText ?? '',
    rashi: p.rashiComments.map((r) =>
      r.dibburHamaschil ? `${r.dibburHamaschil} — ${r.text}` : r.text
    ),
  }));

  return <ReaderLabClient verses={verses} parshaName={aliyah.parsha.name} aliyahNumber={aliyah.number} />;
}

// Simple Hebrew numeral for display (aleph-bet, not full gematria)
const HEB_DIGITS = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט',
  'י', 'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט',
  'כ', 'כא', 'כב', 'כג', 'כד', 'כה', 'כו', 'כז', 'כח', 'כט',
  'ל', 'לא', 'לב', 'לג', 'לד', 'לה', 'לו', 'לז', 'לח', 'לט',
  'מ', 'מא', 'מב', 'מג', 'מד', 'מה', 'מו', 'מז', 'מח', 'מט',
  'נ', 'נא', 'נב', 'נג', 'נד', 'נה', 'נו', 'נז', 'נח', 'נט',
  'ס', 'סא', 'סב', 'סג', 'סד', 'סה', 'סו', 'סז', 'סח', 'סט',
  'ע', 'עא', 'עב', 'עג', 'עד', 'עה', 'עו', 'עז', 'עח', 'עט',
  'פ', 'פא', 'פב', 'פג', 'פד', 'פה', 'פו', 'פז', 'פח', 'פט',
  'צ', 'צא', 'צב', 'צג', 'צד', 'צה', 'צו', 'צז', 'צח', 'צט', 'ק'];

function toHebNum(n: number): string {
  return HEB_DIGITS[n] ?? String(n);
}
