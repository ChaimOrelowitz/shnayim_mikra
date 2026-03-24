import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-ink-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-ink-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-ink-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="btn btn-primary">
          Return Home
        </Link>
      </div>
    </div>
  );
}
