import { PrismaClient } from '@prisma/client';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');
const DOWNLOADS_DIR = '/Users/chaimorelowitz/Downloads';

async function main() {
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });

  const parsha = await prisma.parsha.findFirst({
    where: { name: 'צו' },
    include: { aliyos: { orderBy: { number: 'asc' } } },
  });

  if (!parsha) {
    console.error('❌ Tzav not found in database. Run the seed first.');
    process.exit(1);
  }

  for (const aliyah of parsha.aliyos) {
    const src = join(DOWNLOADS_DIR, `Tzav ${aliyah.number}.pdf`);
    const filename = `tzav-${aliyah.number}.pdf`;
    const dest = join(UPLOADS_DIR, filename);
    const publicPath = `/uploads/${filename}`;

    copyFileSync(src, dest);

    await prisma.aliyah.update({
      where: { id: aliyah.id },
      data: { pdfPath: publicPath },
    });

    console.log(`✅ Aliyah ${aliyah.number} → ${publicPath}`);
  }

  console.log('🎉 All PDFs attached.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
