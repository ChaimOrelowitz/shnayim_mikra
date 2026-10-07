import Link from 'next/link';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Source_Serif_4 } from 'next/font/google';
import styles from './support.module.css';

export const metadata: Metadata = {
  title: 'Support — Shnayim Mikra',
  description: 'Get help with Shnayim Mikra.',
};

const display = Cormorant_Garamond({
  weight: ['500', '600'],
  subsets: ['latin'],
  display: 'swap',
});

const body = Source_Serif_4({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
});

// Small uppercase labels use the site's Latin UI font
const LABEL_FONT = { fontFamily: 'var(--font-poppins), system-ui, sans-serif' };

const NAVY = '#0d1b2a';
const GOLD = '#c8a850';
const PARCHMENT = '#f8f2e3';
const MUTED_ON_NAVY = '#a9b4c2';
const RULE = '#e2d5b5';
const CONTACT_EMAIL = 'office@corsolutions.io';

function MailLink({ className = '' }: { className?: string }) {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className={`${styles.mailLink} ${className}`}>
      {CONTACT_EMAIL}
    </a>
  );
}

function Topic({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t py-12 sm:grid-cols-[13rem_1fr] sm:gap-12 sm:py-14" style={{ borderColor: RULE }}>
      <h2
        className={`${display.className} text-[1.65rem] sm:text-[1.75rem] font-semibold leading-tight`}
        style={{ color: NAVY }}
      >
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function SupportPage() {
  return (
    <main className={`${styles.page} ${body.className}`} style={{ background: PARCHMENT }}>
      {/* Header */}
      <header style={{ background: NAVY }}>
        <div className="mx-auto max-w-3xl px-6 pt-8 pb-20 sm:pt-10 sm:pb-28">
          <Link
            href="/"
            className={`${styles.rise} inline-block text-[11px] font-medium uppercase tracking-[0.3em] transition-opacity hover:opacity-75`}
            style={{ ...LABEL_FONT, color: GOLD }}
          >
            Shnayim Mikra
          </Link>
          <h1
            className={`${display.className} ${styles.rise} ${styles.delay1} mt-16 sm:mt-24 text-5xl sm:text-7xl font-medium leading-[1.02]`}
            style={{ color: PARCHMENT }}
          >
            Shnayim Mikra Support
          </h1>
          <p
            className={`${styles.rise} ${styles.delay2} mt-6 text-lg sm:text-xl`}
            style={{ color: MUTED_ON_NAVY }}
          >
            Need help with Shnayim Mikra? We&apos;re happy to help.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 text-[1.0625rem] leading-[1.8]" style={{ color: '#2b2a26' }}>
        {/* Contact */}
        <section className={`${styles.rise} ${styles.delay3} pt-16 pb-14 sm:pt-24 sm:pb-20`}>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em]" style={{ ...LABEL_FONT, color: GOLD }}>
            ◇ Contact ◇
          </p>
          <p className="mt-6 max-w-xl">
            For questions, technical issues, corrections, or feedback, contact:
          </p>
          <p className={`${display.className} mt-5 text-[1.9rem] sm:text-[2.75rem] font-semibold leading-tight break-words`} style={{ color: NAVY }}>
            <MailLink />
          </p>
          <p className="mt-5 max-w-xl" style={{ color: '#5d5a52' }}>
            Your email comes straight to us, and a person on our team will read it and reply.
          </p>

          <div className="mt-14 max-w-xl">
            <p className="mb-5">When reporting a technical problem, please include:</p>
            <ol className="space-y-3">
              {['your iPhone model;', 'your app version; and', 'a brief description of what happened.'].map((item, i) => (
                <li key={item} className="flex items-baseline gap-5">
                  <span className={`${display.className} text-xl font-semibold`} style={{ color: GOLD }} aria-hidden>
                    {i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Topics */}
        <div className={`${styles.rise} ${styles.delay4}`}>
          <p className="pb-6 text-[11px] font-medium uppercase tracking-[0.3em]" style={{ ...LABEL_FONT, color: GOLD }}>
            ◇ Common Support Topics ◇
          </p>

          <Topic title="Sign-in or account problems">
            <p>
              If you&apos;re having trouble signing in, accessing your account, or restoring your progress,
              contact us and include the email address associated with your Shnayim Mikra account.
            </p>
          </Topic>

          <Topic title="Reading progress or syncing">
            <p>
              If your completed aliyos or other reading progress are not appearing correctly, let us know what
              parsha and Torah-reading cycle you were working on.
            </p>
          </Topic>

          <Topic title="Parsha or calendar issues">
            <p>
              If the app appears to show the wrong weekly parsha, Israel/Diaspora schedule, Torah-reading
              cycle, or double-parsha reading, or has another calendar-related issue, please let us know.
            </p>
          </Topic>

          <Topic title="Text or translation corrections">
            <p>We take the accuracy of the text seriously.</p>
            <p>If you notice an issue with any of the following, please send us the location and the correction:</p>
            <ul className="space-y-2 pt-1">
              {['Hebrew', 'Targum', 'English translation', 'aliyah divisions', 'other text issues'].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-[0.75em] h-1 w-1 shrink-0 rotate-45" style={{ background: GOLD }} aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Topic>

          <Topic title="Account deletion">
            <p>You can initiate deletion of your account from within Shnayim Mikra&apos;s account settings.</p>
            <p>
              If you need assistance with account deletion, contact us at <MailLink className="font-medium" />.
            </p>
          </Topic>

          <Topic title="Privacy">
            <p>
              Read the{' '}
              <Link href="/privacy" className={`${styles.mailLink} font-medium`} style={{ color: NAVY }}>
                Shnayim Mikra Privacy Policy
              </Link>
              .
            </p>
          </Topic>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 sm:mt-24" style={{ ...LABEL_FONT, background: NAVY }}>
        <div className="mx-auto max-w-3xl px-6 py-14 text-sm">
          <p className="max-w-md leading-relaxed" style={{ color: PARCHMENT }}>
            Shnayim Mikra is provided by COR Solutions, operated by COR Therapy LLC.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8" style={{ color: MUTED_ON_NAVY }}>
            <Link href="/privacy" className="transition-opacity hover:opacity-75">Privacy Policy</Link>
            <Link href="/" className="transition-opacity hover:opacity-75">Back to Shnayim Mikra</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-opacity hover:opacity-75 sm:ml-auto" style={{ color: GOLD }}>
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
