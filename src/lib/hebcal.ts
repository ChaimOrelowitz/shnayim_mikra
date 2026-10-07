// Hebcal API integration for current parsha lookup

export type HebcalLocation = 'EY' | 'CHUL';

interface HebcalItem {
  title: string;
  date: string;
  category: string;
  subcat?: string;
}

interface HebcalResponse {
  items: HebcalItem[];
}

export interface CalendarEntry {
  date: string; // YYYY-MM-DD (Saturday)
  chul: string | null;
  ey: string | null;
}

// Strip vowels + non-letters so spelling variants match.
// e.g. "Achrei Mot" === "Acharei Mot", "Tazria-Metzora" !== "Tazria"
export function normalizeParsha(s: string): string {
  return s.toLowerCase().replace(/[aeiou]/g, '').replace(/[^a-z]/g, '');
}

// ── Torah-reading cycles ─────────────────────────────────────────────────────
// A cycle is keyed by its STARTING Hebrew year: cycle 5786 ("5786/7") runs from
// Bereishit after Simchat Torah 5786 through Vezot HaBracha on Simchat Torah 5787.
// Progress rows store this start year in `hebrewYear`.

export const SUPPORTED_CYCLES = [5786, 5787, 5788, 5789];

const hebrewDateFmt = new Intl.DateTimeFormat('en-u-ca-hebrew', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

function hebrewYearOf(date: Date): number {
  const part = hebrewDateFmt.formatToParts(date).find((p) => p.type === 'year');
  return parseInt(part!.value, 10);
}

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Gregorian date (UTC midnight) of Simchat Torah in the given Hebrew year:
// Tishrei 22 in Israel, Tishrei 23 in the diaspora.
export function simchatTorahDate(hebrewYear: number, location: HebcalLocation): Date {
  // Rosh Hashana always falls between Sep 5 and Oct 5
  const d = new Date(Date.UTC(hebrewYear - 3761, 8, 1));
  while (hebrewYearOf(d) !== hebrewYear) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCDate(d.getUTCDate() + (location === 'EY' ? 21 : 22));
  return d;
}

// Start year of the cycle being read now. Switches at Simchat Torah.
export function currentCycleStartYear(location: HebcalLocation, now: Date = new Date()): number {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const year = hebrewYearOf(today);
  return today >= simchatTorahDate(year, location) ? year : year - 1;
}

// 5786 → "5786/7", 5789 → "5789/90"
export function cycleDisplayName(startYear: number): string {
  const a = String(startYear);
  const b = String(startYear + 1);
  let i = 0;
  while (a[i] === b[i]) i++;
  return `${a}/${b.slice(i)}`;
}

// Opening and closing Simchat Torah of a cycle
export function cycleDateWindow(startYear: number, location: HebcalLocation) {
  return {
    opening: simchatTorahDate(startYear, location),
    closing: simchatTorahDate(startYear + 1, location),
  };
}

// ── Hebcal name → corpus parsha ──────────────────────────────────────────────
// Parshiyot are matched by their corpus `order` (1–54; combined readings use
// x.5). Each entry lists the corpus spelling first, then Hebcal's if different.
const PARSHA_NAMES: [number, ...string[]][] = [
  [1, 'Bereishit', 'Bereshit'], [2, 'Noach'], [3, 'Lech Lecha', 'Lech-Lecha'],
  [4, 'Vayera'], [5, 'Chayei Sarah', 'Chayei Sara'], [6, 'Toldot'],
  [7, 'Vayetzei'], [8, 'Vayishlach'], [9, 'Vayeshev'], [10, 'Miketz'],
  [11, 'Vayigash'], [12, 'Vayechi'],
  [13, 'Shemot'], [14, 'Vaera'], [15, 'Bo'], [16, 'Beshalach'], [17, 'Yitro'],
  [18, 'Mishpatim'], [19, 'Terumah'], [20, 'Tetzaveh'], [21, 'Ki Tisa'],
  [22, 'Vayakhel'], [22.5, 'Vayakhel-Pekudei'], [23, 'Pekudei'],
  [24, 'Vayikra'], [25, 'Tzav'], [26, 'Shemini', 'Shmini'], [27, 'Tazria'],
  [27.5, 'Tazria-Metzora'], [28, 'Metzora'], [29, 'Acharei Mot', 'Achrei Mot'],
  [29.5, 'Acharei Mot-Kedoshim', 'Achrei Mot-Kedoshim'], [30, 'Kedoshim'],
  [31, 'Emor'], [32, 'Behar'], [32.5, 'Behar-Bechukotai'], [33, 'Bechukotai'],
  [34, 'Bamidbar'], [35, 'Naso', 'Nasso'], [36, 'Behaalotecha', 'Beha’alotcha'],
  [37, 'Shelach', 'Sh’lach'], [38, 'Korach'], [39, 'Chukat'],
  [39.5, 'Chukat-Balak'], [40, 'Balak'], [41, 'Pinchas'], [42, 'Matot'],
  [42.5, 'Matot-Masei'], [43, 'Masei'],
  [44, 'Devarim'], [45, 'Vaetchanan'], [46, 'Ekev', 'Eikev'], [47, 'Reeh', 'Re’eh'],
  [48, 'Shoftim'], [49, 'Ki Teitzei'], [50, 'Ki Tavo'], [51, 'Nitzavim'],
  [51.5, 'Nitzavim-Vayelech', 'Nitzavim-Vayeilech'], [52, 'Vayelech', 'Vayeilech'],
  [53, 'Haazinu', 'Ha’azinu'], [54, 'Vezot HaBracha', 'Vezot Haberakhah'],
];

export const VEZOT_HABRACHA_ORDER = 54;

const ORDER_BY_NAME = new Map<string, number>(
  PARSHA_NAMES.flatMap(([order, ...names]) => names.map((n) => [normalizeParsha(n), order] as const))
);

// Corpus order for a Hebcal (or corpus) parsha name, or undefined if unknown
export function parshaOrderForName(name: string): number | undefined {
  return ORDER_BY_NAME.get(normalizeParsha(name));
}

function parshaFromTitle(title: string): string {
  return title.replace(/^Parashat\s+/i, '').trim();
}

// Returns the current parsha name for this Shabbat (NOT split on hyphen)
export async function getCurrentParsha(location: HebcalLocation): Promise<string> {
  const geonameid = location === 'EY' ? '281184' : '5128581';
  const url = `https://www.hebcal.com/shabbat?cfg=json&geonameid=${geonameid}&leyning=off&b=18&m=50`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return '';
    const data: HebcalResponse = await res.json();

    const item = data.items?.find(
      (i) => i.category === 'parashat' || i.subcat === 'parashat'
    );
    return item ? parshaFromTitle(item.title) : '';
  } catch {
    return '';
  }
}

export interface CycleReading {
  date: string;   // YYYY-MM-DD
  name: string;   // Hebcal name (or "Vezot HaBracha")
  order: number | undefined; // corpus parsha order
}

// Weekly readings of a cycle in order, from the first Shabbat after the opening
// Simchat Torah through Vezot HaBracha on the closing Simchat Torah.
// Returns [] if Hebcal can't be reached.
export async function getCycleSchedule(
  startYear: number,
  location: HebcalLocation
): Promise<CycleReading[]> {
  const { opening, closing } = cycleDateWindow(startYear, location);
  const url =
    `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=off&min=off&mod=off&nx=off` +
    `&ss=off&mf=off&c=off&s=on&i=${location === 'EY' ? 'on' : 'off'}` +
    `&start=${ymd(opening)}&end=${ymd(closing)}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 86400, tags: [`cycle|${startYear}|${location}`] },
    });
    if (!res.ok) return [];
    const data: HebcalResponse = await res.json();
    const readings: CycleReading[] = (data.items ?? [])
      .filter((i) => i.category === 'parashat' && i.date > ymd(opening) && i.date < ymd(closing))
      .map((i) => {
        const name = parshaFromTitle(i.title);
        return { date: i.date, name, order: parshaOrderForName(name) };
      });
    if (readings.length === 0) return [];
    // Hebcal doesn't list Vezot HaBracha (read on Simchat Torah); it closes every cycle
    readings.push({ date: ymd(closing), name: 'Vezot HaBracha', order: VEZOT_HABRACHA_ORDER });
    return readings;
  } catch {
    return [];
  }
}

// Merged EY + Chul calendar (upcoming entries) for the admin calendar tab
async function fetchParashatMap(year: number, israel: boolean): Promise<Record<string, string>> {
  const url =
    `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=off&min=off&nx=off` +
    `&year=${year}&month=x&ss=off&mf=off&c=off&s=on&i=${israel ? 'on' : 'off'}`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return {};
    const data: HebcalResponse = await res.json();
    const map: Record<string, string> = {};
    for (const item of data.items ?? []) {
      if (item.category === 'parashat') {
        map[item.date] = parshaFromTitle(item.title);
      }
    }
    return map;
  } catch {
    return {};
  }
}

export async function getYearCalendar(): Promise<CalendarEntry[]> {
  const year = new Date().getFullYear();

  const [chulA, eyA, chulB, eyB] = await Promise.all([
    fetchParashatMap(year, false),
    fetchParashatMap(year, true),
    fetchParashatMap(year + 1, false),
    fetchParashatMap(year + 1, true),
  ]);

  const chulMap = { ...chulA, ...chulB };
  const eyMap = { ...eyA, ...eyB };

  const allDates = Array.from(
    new Set([...Object.keys(chulMap), ...Object.keys(eyMap)])
  ).sort();

  const today = new Date().toISOString().slice(0, 10);

  return allDates
    .filter((d) => d >= today)
    .map((date) => ({
      date,
      chul: chulMap[date] ?? null,
      ey: eyMap[date] ?? null,
    }));
}
