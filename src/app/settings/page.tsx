import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsForm } from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) redirect('/login');

  return <SettingsForm profile={{ ...profile, role: profile.role, preferredView: profile.preferredView }} backHref={profile.role === 'ADMIN' ? '/admin' : '/'} />;
}
