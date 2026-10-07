import Link from 'next/link';
import { redirect } from 'next/navigation';

// Placeholder public landing page. The tracker itself lives at /app.
export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  // Supabase email links without a redirectTo land on the Site URL (this page).
  // Hand any auth code to the callback so the user still ends up in the app.
  const { code } = await searchParams;
  if (code) redirect(`/auth/callback?code=${encodeURIComponent(code)}`);

  return (
    <main className="min-h-screen bg-parchment-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold text-ink-900 mb-3">Shnayim Mikra</h1>
        <p className="text-xl text-ink-700 mb-4">Shnayim Mikra, beautifully done.</p>
        <p className="text-ink-500 mb-8">
          Track your weekly Shnayim Mikra v&apos;Echad Targum, aliyah by aliyah.
        </p>
        <Link href="/app" className="btn btn-primary">
          Open the app
        </Link>
        <nav className="mt-12 flex justify-center gap-6 text-sm text-ink-500">
          <Link href="/privacy" className="hover:text-ink-700">Privacy</Link>
          <Link href="/support" className="hover:text-ink-700">Support</Link>
        </nav>
      </div>
    </main>
  );
}
