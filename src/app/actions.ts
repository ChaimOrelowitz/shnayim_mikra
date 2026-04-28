'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// ─── Auth helpers ────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

async function getRequiredUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

async function getRequiredAdmin() {
  const user = await getRequiredUser();
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (profile?.role !== 'ADMIN') throw new Error('Not authorized');
  return user;
}

// ─── User management (admin only) ────────────────────────────────────────────

export async function setUserRole(userId: string, role: 'USER' | 'ADMIN') {
  await getRequiredAdmin();
  await prisma.profile.update({ where: { id: userId }, data: { role } });
  revalidatePath('/admin');
}

export async function deleteUser(userId: string) {
  await getRequiredAdmin();
  // Delete profile (cascades progress); Supabase auth user stays unless we call admin API
  await prisma.profile.delete({ where: { id: userId } });
  revalidatePath('/admin');
}

export async function inviteUser(email: string, firstName: string, lastName: string) {
  await getRequiredAdmin();

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
    data: { firstName, lastName },
  });

  if (error) throw new Error(error.message);

  // Pre-create the profile so admin sees the user immediately (role defaults to USER)
  if (data.user) {
    await prisma.profile.upsert({
      where: { id: data.user.id },
      update: { firstName, lastName },
      create: {
        id: data.user.id,
        email,
        firstName,
        lastName,
        role: 'USER',
      },
    });
  }

  revalidatePath('/admin');
}

// Called after Supabase signup confirmation to create the profile row
export async function ensureProfile() {
  const user = await getRequiredUser();
  const meta = user.user_metadata ?? {};
  await prisma.profile.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
      firstName: meta.firstName ?? null,
      lastName: meta.lastName ?? null,
    },
  });
}

export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  location?: 'EY' | 'CHUL';
  preferredView?: 'CLASSIC' | 'READER';
}) {
  const user = await getRequiredUser();
  await prisma.profile.update({
    where: { id: user.id },
    data,
  });
  revalidatePath('/');
  revalidatePath('/settings');
}

export async function setViewAsUser(on: boolean) {
  await getRequiredAdmin();
  const jar = await cookies();
  if (on) {
    jar.set('shnayim-view-as-user', '1', { path: '/', httpOnly: true, maxAge: 86400 });
  } else {
    jar.delete('shnayim-view-as-user');
  }
  redirect(on ? '/' : '/admin');
}

export async function exitUserMode() {
  const jar = await cookies();
  jar.delete('shnayim-view-as-user');
  redirect('/admin');
}

// ─── Progress helpers ─────────────────────────────────────────────────────────

async function getOrCreateAliyahProgress(userId: string, aliyahId: string, hebrewYear: number) {
  return prisma.userAliyahProgress.upsert({
    where: { userId_aliyahId_hebrewYear: { userId, aliyahId, hebrewYear } },
    update: {},
    create: { userId, aliyahId, hebrewYear },
  });
}

async function getOrCreatePasukProgress(userId: string, pasukId: string, hebrewYear: number) {
  return prisma.userPasukProgress.upsert({
    where: { userId_pasukId_hebrewYear: { userId, pasukId, hebrewYear } },
    update: {},
    create: { userId, pasukId, hebrewYear },
  });
}

// ─── Aliyah progress ─────────────────────────────────────────────────────────

export async function updateAliyahProgress(
  aliyahId: string,
  field: 'done' | 'mikra1' | 'mikra2' | 'targum' | 'rashiReview',
  value: boolean,
  hebrewYear: number
) {
  const user = await getRequiredUser();
  const userId = user.id;

  await ensureProfile();

  // rashiReview is tracked independently — no cascade, no effect on done
  if (field === 'rashiReview') {
    await prisma.userAliyahProgress.upsert({
      where: { userId_aliyahId_hebrewYear: { userId, aliyahId, hebrewYear } },
      update: { rashiReview: value },
      create: { userId, aliyahId, hebrewYear, rashiReview: value },
    });
    revalidatePath('/');
    revalidatePath('/parsha/[id]', 'page');
    return;
  }

  if (field === 'done' && value) {
    await prisma.userAliyahProgress.upsert({
      where: { userId_aliyahId_hebrewYear: { userId, aliyahId, hebrewYear } },
      update: { done: true, mikra1: true, mikra2: true, targum: true },
      create: { userId, aliyahId, hebrewYear, done: true, mikra1: true, mikra2: true, targum: true },
    });
    const pesukim = await prisma.pasuk.findMany({ where: { aliyahId } });
    for (const p of pesukim) {
      await prisma.userPasukProgress.upsert({
        where: { userId_pasukId_hebrewYear: { userId, pasukId: p.id, hebrewYear } },
        update: { done: true, mikra1: true, mikra2: true, targum: true },
        create: { userId, pasukId: p.id, hebrewYear, done: true, mikra1: true, mikra2: true, targum: true },
      });
    }
  } else if (field === 'done' && !value) {
    await prisma.userAliyahProgress.upsert({
      where: { userId_aliyahId_hebrewYear: { userId, aliyahId, hebrewYear } },
      update: { done: false, mikra1: false, mikra2: false, targum: false },
      create: { userId, aliyahId, hebrewYear },
    });
    const pesukim = await prisma.pasuk.findMany({ where: { aliyahId } });
    for (const p of pesukim) {
      await prisma.userPasukProgress.upsert({
        where: { userId_pasukId_hebrewYear: { userId, pasukId: p.id, hebrewYear } },
        update: { done: false, mikra1: false, mikra2: false, targum: false },
        create: { userId, pasukId: p.id, hebrewYear },
      });
    }
  } else {
    const current = await getOrCreateAliyahProgress(userId, aliyahId, hebrewYear);
    const updated = { ...current, [field]: value };
    if (!value) updated.done = false;
    if (updated.mikra1 && updated.mikra2 && updated.targum) updated.done = true;

    await prisma.userAliyahProgress.update({
      where: { userId_aliyahId_hebrewYear: { userId, aliyahId, hebrewYear } },
      data: { [field]: value, done: updated.done },
    });
  }

  revalidatePath('/');
  revalidatePath('/parsha/[id]', 'page');
  revalidatePath('/aliyah/[id]', 'page');
}

export async function markParshaComplete(parshaId: string, done: boolean, hebrewYear: number) {
  const user = await getRequiredUser();
  const userId = user.id;

  await ensureProfile();

  // Fetch all aliyos + their pesukim in one query, then batch everything into one transaction
  const aliyos = await prisma.aliyah.findMany({
    where: { parshaId },
    include: { pesukim: true },
  });

  const aliyahOps = aliyos.map(aliyah =>
    prisma.userAliyahProgress.upsert({
      where: { userId_aliyahId_hebrewYear: { userId, aliyahId: aliyah.id, hebrewYear } },
      update: { done, mikra1: done, mikra2: done, targum: done },
      create: { userId, aliyahId: aliyah.id, hebrewYear, done, mikra1: done, mikra2: done, targum: done },
    })
  );

  const pasukOps = aliyos.flatMap(aliyah =>
    aliyah.pesukim.map(p =>
      prisma.userPasukProgress.upsert({
        where: { userId_pasukId_hebrewYear: { userId, pasukId: p.id, hebrewYear } },
        update: { done, mikra1: done, mikra2: done, targum: done },
        create: { userId, pasukId: p.id, hebrewYear, done, mikra1: done, mikra2: done, targum: done },
      })
    )
  );

  await prisma.$transaction([...aliyahOps, ...pasukOps]);

  revalidatePath('/');
  revalidatePath('/parsha/[id]', 'page');
}

// ─── Pasuk progress ───────────────────────────────────────────────────────────

export async function updatePasukProgress(
  pasukId: string,
  field: 'done' | 'mikra1' | 'mikra2' | 'targum',
  value: boolean,
  hebrewYear: number
) {
  const user = await getRequiredUser();
  const userId = user.id;

  await ensureProfile();

  if (field === 'done' && value) {
    await prisma.userPasukProgress.upsert({
      where: { userId_pasukId_hebrewYear: { userId, pasukId, hebrewYear } },
      update: { done: true, mikra1: true, mikra2: true, targum: true },
      create: { userId, pasukId, hebrewYear, done: true, mikra1: true, mikra2: true, targum: true },
    });
  } else if (field === 'done' && !value) {
    await prisma.userPasukProgress.upsert({
      where: { userId_pasukId_hebrewYear: { userId, pasukId, hebrewYear } },
      update: { done: false, mikra1: false, mikra2: false, targum: false },
      create: { userId, pasukId, hebrewYear },
    });
  } else {
    const current = await getOrCreatePasukProgress(userId, pasukId, hebrewYear);
    const updated = { ...current, [field]: value };
    if (!value) updated.done = false;
    if (updated.mikra1 && updated.mikra2 && updated.targum) updated.done = true;

    await prisma.userPasukProgress.update({
      where: { userId_pasukId_hebrewYear: { userId, pasukId, hebrewYear } },
      data: { [field]: value, done: updated.done },
    });
  }

  revalidatePath('/aliyah/[id]', 'page');
}

// ─── Reader view progress ────────────────────────────────────────────────────

// Marks all pesukim up to and including pasukId as done (mikra1+mikra2+targum).
// If it's the last pasuk in the aliyah, marks the aliyah done too.
export async function readerBookmarkChumash(
  aliyahId: string,
  pasukId: string,
  hebrewYear: number
) {
  const user = await getRequiredUser();
  const userId = user.id;
  await ensureProfile();

  const pesukim = await prisma.pasuk.findMany({
    where: { aliyahId },
    orderBy: [{ perek: 'asc' }, { pasuk: 'asc' }],
    select: { id: true },
  });

  const bookmarkIndex = pesukim.findIndex((p) => p.id === pasukId);
  if (bookmarkIndex === -1) return;

  const toMark = pesukim.slice(0, bookmarkIndex + 1);
  const isLastPasuk = bookmarkIndex === pesukim.length - 1;

  const pasukOps = toMark.map((p) =>
    prisma.userPasukProgress.upsert({
      where: { userId_pasukId_hebrewYear: { userId, pasukId: p.id, hebrewYear } },
      update: { done: true, mikra1: true, mikra2: true, targum: true },
      create: { userId, pasukId: p.id, hebrewYear, done: true, mikra1: true, mikra2: true, targum: true },
    })
  );

  if (isLastPasuk) {
    const aliyahOp = prisma.userAliyahProgress.upsert({
      where: { userId_aliyahId_hebrewYear: { userId, aliyahId, hebrewYear } },
      update: { done: true, mikra1: true, mikra2: true, targum: true },
      create: { userId, aliyahId, hebrewYear, done: true, mikra1: true, mikra2: true, targum: true },
    });
    await prisma.$transaction([...pasukOps, aliyahOp]);
  } else {
    await prisma.$transaction(pasukOps);
  }

  revalidatePath('/');
  revalidatePath('/parsha/[id]', 'page');
  revalidatePath('/aliyah/[id]', 'page');
}

// ─── PDF management (admin only) ─────────────────────────────────────────────

function getSupabaseStorage() {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Returns a signed upload URL so the client can upload directly to Supabase
// (avoids Vercel's 4.5MB serverless body limit)
export async function getSignedUploadUrl(aliyahId: string, filename: string) {
  await getRequiredAdmin();

  const timestamp = Date.now();
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${aliyahId}/${timestamp}_${sanitizedName}`;

  const supabase = getSupabaseStorage();
  const { data, error } = await supabase.storage
    .from('pdfs')
    .createSignedUploadUrl(path);

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(path);

  return { signedUrl: data.signedUrl, path, publicUrl: urlData.publicUrl };
}

// Called after the client finishes uploading directly to Supabase
export async function savePdfPath(aliyahId: string, publicUrl: string) {
  await getRequiredAdmin();

  await prisma.aliyah.update({
    where: { id: aliyahId },
    data: { pdfPath: publicUrl },
  });

  revalidatePath('/parsha/[id]', 'page');
  revalidatePath('/aliyah/[id]', 'page');
}

export async function uploadPDF(aliyahId: string, formData: FormData) {
  await getRequiredAdmin();

  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${aliyahId}/${timestamp}_${sanitizedName}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const supabase = getSupabaseStorage();
  const { error } = await supabase.storage.from('pdfs').upload(filename, buffer, {
    contentType: 'application/pdf',
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('pdfs').getPublicUrl(filename);

  await prisma.aliyah.update({
    where: { id: aliyahId },
    data: { pdfPath: data.publicUrl },
  });

  revalidatePath('/parsha/[id]', 'page');
  revalidatePath('/aliyah/[id]', 'page');

  return data.publicUrl;
}

export async function removePDF(aliyahId: string) {
  await getRequiredAdmin();

  const aliyah = await prisma.aliyah.findUnique({ where: { id: aliyahId } });

  if (aliyah?.pdfPath) {
    const supabase = getSupabaseStorage();
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
