import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsForm } from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) {
    profile = await prisma.profile.upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id, email: user.email! },
    });
  }

  return <SettingsForm profile={{ firstName: profile.firstName, lastName: profile.lastName, email: profile.email, location: profile.location, preferredView: profile.preferredView }} backHref={profile.role === 'ADMIN' ? '/admin' : '/'} />;
}
