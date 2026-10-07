import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Source_Serif_4 } from 'next/font/google';
import styles from './privacy.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy — Shnayim Mikra',
  description: 'How Shnayim Mikra collects, uses, and protects your information.',
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
const CONTACT_EMAIL = 'office@corsolutions.io';

const SECTIONS = [
  ['information', 'Information We Collect'],
  ['progress', 'Reading Progress'],
  ['groups', 'Group Features'],
  ['reminders', 'Reminders and Notifications'],
  ['device', 'Information Stored on Your Device'],
  ['biometrics', 'Biometric Authentication'],
  ['location', 'Location'],
  ['services', 'Services We Use'],
  ['use', 'How We Use Information'],
  ['advertising', 'Advertising and Tracking'],
  ['sharing', 'Sharing of Information'],
  ['retention', 'Data Retention'],
  ['deletion', 'Account Deletion'],
  ['children', 'Children and Educational Use'],
  ['security', 'Security'],
  ['changes', 'Changes to This Policy'],
  ['contact', 'Contact'],
] as const;

type SectionId = (typeof SECTIONS)[number][0];

function Section({ id, children }: { id: SectionId; children: React.ReactNode }) {
  const title = SECTIONS.find(([s]) => s === id)![1];
  return (
    <section id={id} className={`${styles.section} pt-12 sm:pt-14`}>
      <div className="mb-6 flex items-center gap-3" aria-hidden>
        <span className="h-px w-8" style={{ background: GOLD }} />
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />
      </div>
      <h2
        className={`${display.className} mb-5 text-[1.75rem] sm:text-[2rem] font-semibold leading-tight`}
        style={{ color: NAVY }}
      >
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className={`${display.className} pt-4 text-[1.35rem] font-semibold`}
      style={{ color: NAVY }}
    >
      {children}
    </h3>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 py-1">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GOLD }} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <main className={`${styles.page} ${body.className} min-h-screen`} style={{ background: PARCHMENT }}>
      {/* Header */}
      <header style={{ background: NAVY }}>
        <div className="mx-auto max-w-2xl px-6 pt-8 pb-16 sm:pt-10 sm:pb-20">
          <Link
            href="/"
            className={`${styles.rise} inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] transition-opacity hover:opacity-75`}
            style={{ ...LABEL_FONT, color: GOLD }}
          >
            <Image src="/app-icon.png" alt="" width={32} height={32} className="rounded-[8px]" />
            Shnayim Mikra
          </Link>
          <h1
            className={`${display.className} ${styles.rise} ${styles.delay1} mt-14 sm:mt-20 text-5xl sm:text-6xl font-medium leading-[1.05]`}
            style={{ color: PARCHMENT }}
          >
            Privacy Policy
          </h1>
          <p
            className={`${styles.rise} ${styles.delay2} mt-5 text-sm tracking-wide`}
            style={{ ...LABEL_FONT, color: '#a9b4c2' }}
          >
            Effective Date: October 7, 2026
          </p>
        </div>
      </header>

      <article
        className={`${styles.rise} ${styles.delay3} mx-auto max-w-2xl px-6 pt-12 pb-20 text-[1.0625rem] leading-[1.8]`}
        style={{ color: '#2b2a26' }}
      >
        {/* Intro */}
        <div className="space-y-4">
          <p>Shnayim Mikra is provided by COR Solutions, operated by COR Therapy LLC.</p>
          <p>
            We built Shnayim Mikra to provide a focused and private way to complete{' '}
            <span lang="he" dir="rtl" className="font-hebrew whitespace-nowrap text-[1.15em]">שנים מקרא ואחד תרגום</span>, keep
            track of your progress, and use optional shared features.
          </p>
          <p>
            This Privacy Policy explains what information we collect, how we use it, and when limited
            information may be visible to others.
          </p>
        </div>

        {/* Contents */}
        <nav aria-label="Contents" className="mt-12 border-y py-8" style={{ borderColor: '#e2d5b5' }}>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.3em]" style={{ ...LABEL_FONT, color: GOLD }}>
            Contents
          </p>
          <ol className="grid gap-x-8 gap-y-1.5 text-[0.9375rem] sm:grid-cols-2">
            {SECTIONS.map(([id, title]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="transition-colors hover:text-[#0d1b2a]"
                  style={{ color: '#5d5a52' }}
                >
                  {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Section id="information">
          <p>To create and use a Shnayim Mikra account, we may collect:</p>
          <List
            items={[
              'your name;',
              'your email address;',
              'a unique account identifier used by our authentication system; and',
              'information needed to authenticate and maintain your account.',
            ]}
          />
          <p>We collect only the account information reasonably necessary to operate Shnayim Mikra.</p>
          <p>
            Your email address is private account information. We do not sell, rent, trade, or provide our
            user email list to advertisers, marketers, or other organizations for their own marketing
            purposes.
          </p>
        </Section>

        <Section id="progress">
          <p>Shnayim Mikra may store information about your reading activity, including:</p>
          <List
            items={[
              'which aliyos you have completed;',
              'pasuk-level progress where applicable;',
              'the Torah-reading cycle associated with your progress; and',
              'information needed to synchronize your progress across devices.',
            ]}
          />
          <p>
            Reading progress is associated with your account so that it can be restored and synchronized
            when you sign in.
          </p>
        </Section>

        <Section id="groups">
          <p>Shnayim Mikra may offer optional shared or group-based features.</p>
          <p>
            If you choose to join a group, your{' '}
            <strong className="font-medium" style={{ color: NAVY }}>
              name may be visible to other members and authorized organizers of that group
            </strong>{' '}
            so that participants can identify one another.
          </p>
          <p>
            Depending on the feature, limited information about your participation or reading progress may
            also be visible within the group. This may include information such as whether you have joined,
            whether you have completed a particular reading goal, or whether you have completed the
            week&apos;s reading.
          </p>
          <p>
            Your email address is not displayed to other group members simply because you participate in a
            group.
          </p>
          <p>
            Authorized organizers may have access to limited information reasonably necessary to administer
            the applicable group or shared feature.
          </p>
        </Section>

        <Section id="reminders">
          <p>Shnayim Mikra may offer limited reminders associated with reading or group participation.</p>
          <p>
            For example, a participant or organizer may be able to trigger a notification reminding another
            participant to complete a reading goal.
          </p>
          <p>
            These features are not an open messaging or chat system. Shnayim Mikra may place reasonable
            limits on the number or frequency of reminders in order to prevent excessive notifications or
            misuse.
          </p>
          <p>
            If you enable push notifications, notification delivery is handled using Apple&apos;s
            notification services and your device settings.
          </p>
        </Section>

        <Section id="device">
          <p>Shnayim Mikra may store certain information locally on your device, including:</p>
          <List
            items={[
              'reading progress;',
              'bookmarks;',
              'reader and display preferences;',
              'your selected Israel or Diaspora calendar setting;',
              'cached Torah-reading schedule information;',
              'authentication/session information; and',
              'other app preferences.',
            ]}
          />
          <p>
            Some information stored locally may also be synchronized with our servers when you are signed in.
          </p>
        </Section>

        <Section id="biometrics">
          <p>
            If you enable Face ID or another device biometric feature for access to Shnayim Mikra, biometric
            verification is handled by your device&apos;s operating system.
          </p>
          <p>Shnayim Mikra does not receive, store, or have access to your biometric information.</p>
        </Section>

        <Section id="location">
          <p>
            Shnayim Mikra may ask you to choose whether you follow the Torah-reading schedule for Israel or
            the Diaspora.
          </p>
          <p>
            This is a setting that you select manually. Shnayim Mikra does not use your device&apos;s precise
            geographic location to determine this setting.
          </p>
        </Section>

        <Section id="services">
          <H3>Supabase</H3>
          <p>
            We use Supabase for services including account authentication, database storage, and
            synchronization of reading progress.
          </p>
          <p>
            Information transmitted to Supabase may include your account information, account identifier,
            authentication information, and reading progress.
          </p>
          <p>
            Supabase may also process technical information such as IP addresses, request information, and
            security logs as part of operating its infrastructure.
          </p>
          <H3>Hebcal</H3>
          <p>We use Hebcal to obtain Jewish calendar and Torah-reading information.</p>
          <p>
            Requests to Hebcal may include relevant dates and whether the Israel or Diaspora calendar is
            being used.
          </p>
          <p>
            We do not intentionally send your Shnayim Mikra account identifier, name, email address, or
            reading progress to Hebcal.
          </p>
          <p>As with ordinary internet requests, Hebcal may receive technical information such as your IP address.</p>
        </Section>

        <Section id="use">
          <p>We use information collected through Shnayim Mikra to:</p>
          <List
            items={[
              'create, authenticate, and secure user accounts;',
              'synchronize reading progress;',
              'provide the appropriate Torah-reading schedule;',
              'identify participants within optional shared features;',
              'administer group participation;',
              'provide limited reminders and notifications;',
              'maintain your app preferences;',
              'provide user support;',
              'protect the security and reliability of the service; and',
              'operate and improve Shnayim Mikra.',
            ]}
          />
          <p>We do not use your personal information to build advertising profiles.</p>
        </Section>

        <Section id="advertising">
          <p>Shnayim Mikra does not contain third-party advertising.</p>
          <p>We do not sell personal information or user lists.</p>
          <p>
            We do not use your information for cross-app or cross-site advertising, and we do not currently
            use advertising or behavioral-tracking SDKs.
          </p>
        </Section>

        <Section id="sharing">
          <p>
            We may share information with service providers that are necessary to operate Shnayim Mikra,
            including providers of authentication, hosting, database, notification, and calendar services.
          </p>
          <p>
            If you voluntarily participate in a group or shared feature, your name and limited participation
            or progress information may be visible to other members or authorized organizers as part of that
            feature.
          </p>
          <p>
            Your email address is not ordinarily displayed to other users or shared with group participants
            for unrelated solicitation or marketing.
          </p>
          <p>
            We may also disclose information if required by law or when reasonably necessary to protect our
            users, our service, or our legal rights.
          </p>
        </Section>

        <Section id="retention">
          <p>
            We retain account information and synchronized reading progress for as long as your account
            remains active or as reasonably necessary to provide Shnayim Mikra.
          </p>
          <p>
            Information stored on your device may remain until you remove it, sign out, delete the app, or
            otherwise clear the applicable data.
          </p>
          <p>
            Service providers may retain limited technical or security records according to their own
            policies and legal obligations.
          </p>
        </Section>

        <Section id="deletion">
          <p>
            You may initiate deletion of your Shnayim Mikra account through the account settings available
            within the app.
          </p>
          <p>
            When an account is deleted, the associated Shnayim Mikra account information and synchronized
            reading-progress data are removed from our active systems, subject to limited information that
            may need to be retained for security, legal, fraud-prevention, or similar legitimate purposes.
          </p>
          <p>Deleting the app from your device does not by itself delete your account.</p>
        </Section>

        <Section id="children">
          <p>Shnayim Mikra may be useful to individuals and groups of different ages.</p>
          <p>
            If we introduce features specifically designed for organizations managing accounts or
            participation for children, we may provide additional privacy information or controls where
            appropriate and required by law.
          </p>
        </Section>

        <Section id="security">
          <p>
            We use reasonable technical and organizational measures designed to protect information
            associated with Shnayim Mikra.
          </p>
          <p>No internet-based service or storage system can be guaranteed to be completely secure.</p>
        </Section>

        <Section id="changes">
          <p>
            We may update this Privacy Policy as Shnayim Mikra evolves or as legal and operational
            requirements change.
          </p>
          <p>When we update this policy, we will revise the effective date shown above.</p>
        </Section>

        <Section id="contact">
          <p>
            For questions about this Privacy Policy or Shnayim Mikra&apos;s privacy practices, please
            contact:
          </p>
          <address className="not-italic pt-2 leading-[1.9]">
            <span className="font-medium" style={{ color: NAVY }}>Shnayim Mikra</span>
            <br />
            <span className="font-medium" style={{ color: NAVY }}>COR Solutions</span>
            <br />
            Operated by <span className="font-medium" style={{ color: NAVY }}>COR Therapy LLC</span>
            <br />
            <span className="mt-3 inline-block">
              <span className="font-medium" style={{ color: NAVY }}>Email:</span>{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline decoration-1 underline-offset-4 transition-colors hover:text-[#0d1b2a]"
                style={{ textDecorationColor: GOLD }}
              >
                {CONTACT_EMAIL}
              </a>
            </span>
          </address>
        </Section>
      </article>

      {/* Footer */}
      <footer style={{ ...LABEL_FONT, background: NAVY }}>
        <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-12 text-sm sm:flex-row sm:items-end sm:justify-between">
          <nav className="flex flex-col gap-3">
            <Link href="/support" className="transition-opacity hover:opacity-75" style={{ color: PARCHMENT }}>
              Support
            </Link>
            <Link href="/" className="transition-opacity hover:opacity-75" style={{ color: PARCHMENT }}>
              Back to Shnayim Mikra
            </Link>
          </nav>
          <div className="flex flex-col gap-1.5 sm:items-end" style={{ color: '#a9b4c2' }}>
            <span className="text-[11px] font-medium uppercase tracking-[0.3em]" style={{ ...LABEL_FONT, color: GOLD }}>
              COR Solutions
            </span>
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-opacity hover:opacity-75">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
