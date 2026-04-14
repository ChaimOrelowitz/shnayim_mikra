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

// Returns the current parsha name(s) for this Shabbat
export async function getCurrentParsha(location: HebcalLocation): Promise<string[]> {
  const geonameid = location === 'EY' ? '281184' : '5128581';
  const url = `https://www.hebcal.com/shabbat?cfg=json&geonameid=${geonameid}&leyning=off&b=18&m=50`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data: HebcalResponse = await res.json();

    const parshaItem = data.items?.find(
      (i) => i.category === 'parashat' || i.subcat === 'parashat'
    );
    if (!parshaItem) return [];

    const name = parshaItem.title.replace(/^Parashat\s+/i, '').trim();
    return name.split('-').map((n) => n.trim());
  } catch {
    return [];
  }
}

async function fetchParashatMap(year: number, israel: boolean): Promise<Record<string, string>> {
  const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=off&min=off&nx=off&year=${year}&month=x&ss=off&mf=off&c=off&s=on&i=${israel ? 'on' : 'off'}`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return {};
    const data: HebcalResponse = await res.json();
    const map: Record<string, string> = {};
    for (const item of data.items ?? []) {
      if (item.category === 'parashat') {
        map[item.date] = item.title.replace(/^Parashat\s+/i, '').trim();
      }
    }
    return map;
  } catch {
    return {};
  }
}

// Merged EY + Chul schedule from today through the end of next Gregorian year
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
