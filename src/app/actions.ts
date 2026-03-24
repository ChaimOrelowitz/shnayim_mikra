'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateAliyahProgress(
  aliyahId: string,
  field: 'done' | 'mikra1' | 'mikra2' | 'targum',
  value: boolean
) {
  if (field === 'done' && value) {
    // If setting done to true, set all others to true
    await prisma.aliyah.update({
      where: { id: aliyahId },
      data: {
        done: true,
        mikra1: true,
        mikra2: true,
        targum: true,
      },
    });

    // Also update all pesukim
    await prisma.pasuk.updateMany({
      where: { aliyahId },
      data: {
        done: true,
        mikra1: true,
        mikra2: true,
        targum: true,
      },
    });
  } else if (field === 'done' && !value) {
    // If setting done to false, set all others to false
    await prisma.aliyah.update({
      where: { id: aliyahId },
      data: {
        done: false,
        mikra1: false,
        mikra2: false,
        targum: false,
      },
    });

    // Also update all pesukim
    await prisma.pasuk.updateMany({
      where: { aliyahId },
      data: {
        done: false,
        mikra1: false,
        mikra2: false,
        targum: false,
      },
    });
  } else {
    // Update the specific field
    await prisma.aliyah.update({
      where: { id: aliyahId },
      data: { [field]: value },
    });

    // If unchecking any of mikra1, mikra2, or targum, uncheck done
    if (!value && field !== 'done') {
      await prisma.aliyah.update({
        where: { id: aliyahId },
        data: { done: false },
      });
    }

    // If all three are now true, set done to true
    if (value && field !== 'done') {
      const aliyah = await prisma.aliyah.findUnique({
        where: { id: aliyahId },
      });

      if (aliyah) {
        const updatedAliyah = { ...aliyah, [field]: value };
        if (
          updatedAliyah.mikra1 &&
          updatedAliyah.mikra2 &&
          updatedAliyah.targum
        ) {
          await prisma.aliyah.update({
            where: { id: aliyahId },
            data: { done: true },
          });
        }
      }
    }
  }

  revalidatePath('/');
  revalidatePath('/parsha/[id]', 'page');
  revalidatePath('/aliyah/[id]', 'page');
}

export async function updatePasukProgress(
  pasukId: string,
  field: 'done' | 'mikra1' | 'mikra2' | 'targum',
  value: boolean
) {
  if (field === 'done' && value) {
    // If setting done to true, set all others to true
    await prisma.pasuk.update({
      where: { id: pasukId },
      data: {
        done: true,
        mikra1: true,
        mikra2: true,
        targum: true,
      },
    });
  } else if (field === 'done' && !value) {
    // If setting done to false, set all others to false
    await prisma.pasuk.update({
      where: { id: pasukId },
      data: {
        done: false,
        mikra1: false,
        mikra2: false,
        targum: false,
      },
    });
  } else {
    // Update the specific field
    await prisma.pasuk.update({
      where: { id: pasukId },
      data: { [field]: value },
    });

    // If unchecking any of mikra1, mikra2, or targum, uncheck done
    if (!value && field !== 'done') {
      await prisma.pasuk.update({
        where: { id: pasukId },
        data: { done: false },
      });
    }

    // If all three are now true, set done to true
    if (value && field !== 'done') {
      const pasuk = await prisma.pasuk.findUnique({
        where: { id: pasukId },
      });

      if (pasuk) {
        const updatedPasuk = { ...pasuk, [field]: value };
        if (
          updatedPasuk.mikra1 &&
          updatedPasuk.mikra2 &&
          updatedPasuk.targum
        ) {
          await prisma.pasuk.update({
            where: { id: pasukId },
            data: { done: true },
          });
        }
      }
    }
  }

  revalidatePath('/aliyah/[id]', 'page');
}

export async function uploadPDF(aliyahId: string, formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('No file provided');
  }

  // Create uploads directory if it doesn't exist
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}_${sanitizedName}`;
  const filepath = path.join(uploadsDir, filename);

  // Save file
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await fs.writeFile(filepath, buffer);

  // Update aliyah with PDF path
  const pdfPath = `/uploads/${filename}`;
  await prisma.aliyah.update({
    where: { id: aliyahId },
    data: { pdfPath },
  });

  revalidatePath('/parsha/[id]', 'page');
  revalidatePath('/aliyah/[id]', 'page');

  return pdfPath;
}

export async function removePDF(aliyahId: string) {
  const aliyah = await prisma.aliyah.findUnique({
    where: { id: aliyahId },
  });

  if (aliyah?.pdfPath) {
    // Delete file from filesystem
    const fs = await import('fs/promises');
    const path = await import('path');
    const filepath = path.join(process.cwd(), 'public', aliyah.pdfPath);
    
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  // Remove PDF path from database
  await prisma.aliyah.update({
    where: { id: aliyahId },
    data: { pdfPath: null },
  });

  revalidatePath('/parsha/[id]', 'page');
  revalidatePath('/aliyah/[id]', 'page');
}
