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

// Approximate current Hebrew year (±1 month accurate)
export function currentHebrewYear(): number {
  const now = new Date();
  // Rosh Hashana is in Sep/Oct (month index 8-9). After it, the Hebrew year increments.
  return now.getMonth() >= 8 ? now.getFullYear() + 3761 : now.getFullYear() + 3760;
}

// "5786" → "2025–26"
export function hebrewYearLabel(y: number): string {
  const start = y - 3761;
  return `${y} (${start}–${String(start + 1).slice(2)})`;
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

// Returns the list of parsha names read in a given Hebrew year for EY or Chul.
// Uses yt=H so the year parameter is treated as a Hebrew year.
export async function getScheduleForYear(
  hebrewYear: number,
  location: HebcalLocation
): Promise<string[]> {
  const url =
    `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=off&min=off&nx=off` +
    `&year=${hebrewYear}&month=x&ss=off&mf=off&c=off&s=on` +
    `&i=${location === 'EY' ? 'on' : 'off'}&yt=H`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data: HebcalResponse = await res.json();
    return (data.items ?? [])
      .filter((i) => i.category === 'parashat')
      .map((i) => parshaFromTitle(i.title));
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
