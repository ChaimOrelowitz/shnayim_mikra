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

export async function markParshaComplete(parshaId: string, done: boolean) {
  const aliyos = await prisma.aliyah.findMany({ where: { parshaId } });

  await prisma.aliyah.updateMany({
    where: { parshaId },
    data: { done, mikra1: done, mikra2: done, targum: done },
  });

  await prisma.pasuk.updateMany({
    where: { aliyahId: { in: aliyos.map((a) => a.id) } },
    data: { done, mikra1: done, mikra2: done, targum: done },
  });

  revalidatePath('/');
  revalidatePath('/parsha/[id]', 'page');
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

function getSupabase() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function uploadPDF(aliyahId: string, formData: FormData) {
  const file = formData.get('file') as File;

  if (!file) throw new Error('No file provided');

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${aliyahId}/${timestamp}_${sanitizedName}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const supabase = getSupabase();
  const { error } = await supabase.storage.from('pdfs').upload(filename, buffer, {
    contentType: 'application/pdf',
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('pdfs').getPublicUrl(filename);
  const pdfPath = data.publicUrl;

  await prisma.aliyah.update({
    where: { id: aliyahId },
    data: { pdfPath },
  });

  revalidatePath('/parsha/[id]', 'page');
  revalidatePath('/aliyah/[id]', 'page');

  return pdfPath;
}

export async function removePDF(aliyahId: string) {
  const aliyah = await prisma.aliyah.findUnique({ where: { id: aliyahId } });

  if (aliyah?.pdfPath) {
    const supabase = getSupabase();
    // Extract the storage path from the public URL
    const url = new URL(aliyah.pdfPath);
    const storagePath = url.pathname.split('/object/public/pdfs/')[1];
    if (storagePath) {
      await supabase.storage.from('pdfs').remove([storagePath]);
    }
  }

  await prisma.aliyah.update({
    where: { id: aliyahId },
    data: { pdfPath: null },
  });

  revalidatePath('/parsha/[id]', 'page');
  revalidatePath('/aliyah/[id]', 'page');
}
