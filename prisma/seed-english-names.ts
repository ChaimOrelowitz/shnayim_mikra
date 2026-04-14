import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ENGLISH_NAMES: Record<number, string> = {
  1:  'Bereishit',
  2:  'Noach',
  3:  'Lech Lecha',
  4:  'Vayera',
  5:  'Chayei Sarah',
  6:  'Toldot',
  7:  'Vayetzei',
  8:  'Vayishlach',
  9:  'Vayeshev',
  10: 'Miketz',
  11: 'Vayigash',
  12: 'Vayechi',
  13: 'Shemot',
  14: 'Vaera',
  15: 'Bo',
  16: 'Beshalach',
  17: 'Yitro',
  18: 'Mishpatim',
  19: 'Terumah',
  20: 'Tetzaveh',
  21: 'Ki Tisa',
  22: 'Vayakhel',
  23: 'Pekudei',
  24: 'Vayikra',
  25: 'Tzav',
  26: 'Shemini',
  27: 'Tazria',
  28: 'Metzora',
  29: 'Acharei Mot',
  30: 'Kedoshim',
  31: 'Emor',
  32: 'Behar',
  33: 'Bechukotai',
  34: 'Bamidbar',
  35: 'Naso',
  36: 'Behaalotecha',
  37: 'Shelach',
  38: 'Korach',
  39: 'Chukat',
  40: 'Balak',
  41: 'Pinchas',
  42: 'Matot',
  43: 'Masei',
  44: 'Devarim',
  45: 'Vaetchanan',
  46: 'Ekev',
  47: 'Reeh',
  48: 'Shoftim',
  49: 'Ki Teitzei',
  50: 'Ki Tavo',
  51: 'Nitzavim',
  52: 'Vayelech',
  53: 'Haazinu',
  54: 'Vezot HaBracha',
};

async function main() {
  console.log('Adding English names to parshiyos...');

  for (const [order, englishName] of Object.entries(ENGLISH_NAMES)) {
    await prisma.parsha.updateMany({
      where: { order: Number(order) },
      data: { englishName },
    });
  }

  console.log('Done.');
}

main().finally(() => prisma.$disconnect());
