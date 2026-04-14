// Hebcal API integration for current parsha lookup

export type HebcalLocation = 'EY' | 'CHUL';

interface HebcalItem {
  title: string;
  date: string;
  category: string;
  subcat?: string;
  hebrew?: string;
}

interface HebcalResponse {
  items: HebcalItem[];
}

// Returns the current parsha name(s) for this Shabbat
// EY uses Jerusalem, CHUL uses a generic diaspora location (New York)
export async function getCurrentParsha(location: HebcalLocation): Promise<string[]> {
  // Jerusalem for EY, New York for CHUL
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

    // Title is like "Parashat Bereshit" or "Parashat Achrei Mot-Kedoshim"
    const name = parshaItem.title.replace(/^Parashat\s+/i, '').trim();

    // Some combined parshas have a hyphen: split them
    return name.split('-').map((n) => n.trim());
  } catch {
    return [];
  }
}

// Returns the full yearly schedule: Map of parsha englishName → date string (YYYY-MM-DD)
export async function getYearlySchedule(location: HebcalLocation): Promise<Record<string, string>> {
  const geonameid = location === 'EY' ? '281184' : '5128581';
  // Get next ~12 months of Torah readings
  const now = new Date();
  const year = now.getFullYear();
  const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=off&nx=off&year=${year}&month=x&ss=off&mf=off&c=off&geo=geoname&geonameid=${geonameid}&M=on&s=on&i=${location === 'EY' ? 'on' : 'off'}`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return {};
    const data: HebcalResponse = await res.json();

    const schedule: Record<string, string> = {};
    for (const item of data.items ?? []) {
      if (item.category !== 'parashat') continue;
      const name = item.title.replace(/^Parashat\s+/i, '').trim();
      schedule[name] = item.date;
    }
    return schedule;
  } catch {
    return {};
  }
}
