import Link from 'next/link';

export const metadata = { title: 'Support — Shnayim Mikra' };

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-parchment-50 p-6">
      <div className="max-w-2xl mx-auto py-12">
        <Link href="/" className="text-sm text-ink-500 hover:text-ink-700">← Back</Link>
        <h1 className="text-3xl font-bold text-ink-900 mt-6 mb-6">Support</h1>
        <div className="bg-white rounded-2xl border border-parchment-200 p-6 text-ink-700">
          <p>Support information coming here.</p>
        </div>
      </div>
    </main>
  );
}
