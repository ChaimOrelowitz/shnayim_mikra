import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Cormorant_Garamond, Source_Serif_4 } from 'next/font/google';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ReaderDemo } from '@/components/ReaderDemo';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: 'Shnayim Mikra — beautifully done',
  description:
    "A focused, thoughtfully designed way to complete Shnayim Mikra v'Echad Targum every week.",
};

// ── Fill these in ────────────────────────────────────────────────────────────

// The App Store listing URL. While null, the badge is shown unlinked with
// "Coming soon" beneath it.
const APP_STORE_URL: string | null = null;

// Real iOS screenshots (portrait PNGs placed in /public/screenshots/).
// While a slot is null, that spot shows typeset text instead of an app screen.
const SCREENSHOTS: Record<'hero' | 'aliyah' | 'progress' | 'bookmark' | 'reader', string | null> = {
  hero: null,
  aliyah: null,
  progress: null,
  bookmark: null,
  reader: null,
};

// ─────────────────────────────────────────────────────────────────────────────

const display = Cormorant_Garamond({ weight: ['500', '600'], subsets: ['latin'], display: 'swap' });
const body = Source_Serif_4({ weight: ['400', '500'], subsets: ['latin'], display: 'swap' });
const LABEL_FONT = { fontFamily: 'var(--font-poppins), system-ui, sans-serif' };

// Palette from the iOS app (ShnayimMikra/Theme.swift)
const BG_DARK = '#0A0E1A';                      // pageBg (dark)
const NAVY_DEEP = '#080C18';                    // navBg (dark)
const INK = '#1A2538';                          // pageText (light)
const PARCHMENT = '#F2EAD0';                    // pageBg (light) / pageText (dark)
const AMBER = '#D4A574';                        // accent (dark)
const GOLD = '#B89455';                         // accent (light)
const GOLD_DEEP = '#8E6E36';                    // accentDeep (light)
const TARGUM_INK = '#264D9D';                   // targumInk (light)
const RASHI_SURFACE = '#F0E6CC';                // rashiSurface (light)
const MUTED = 'rgba(26, 37, 56, 0.62)';         // pageTextSoft (light)
const FAINT = 'rgba(26, 37, 56, 0.40)';         // pageTextFaint (light)
const MUTED_ON_NAVY = 'rgba(242, 234, 208, 0.65)'; // pageTextSoft (dark)
const RULE = 'rgba(26, 37, 56, 0.10)';          // cardBorder (light)

// Bereishit 1:1–3, Onkelos and Rashi, copied from the app's bundled corpus
// (Resources/pesukim.json).
const PESUKIM = [
  "בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃",
  "וְהָאָ֗רֶץ הָיְתָ֥ה תֹ֙הוּ֙ וָבֹ֔הוּ וְחֹ֖שֶׁךְ עַל־פְּנֵ֣י תְה֑וֹם וְר֣וּחַ אֱלֹהִ֔ים מְרַחֶ֖פֶת עַל־פְּנֵ֥י הַמָּֽיִם׃",
  "וַיֹּ֥אמֶר אֱלֹהִ֖ים יְהִ֣י א֑וֹר וַֽיְהִי־אֽוֹר׃",
];
const TARGUM = "בְּקַדְמִין בְּרָא יְיָ יָת שְׁמַיָּא וְיָת אַרְעָא:";

// Rashi with nikud, and the English translation, for the reader sample.
// (Doubled vowel marks in the corpus Rashi are collapsed for display.)
const RASHI_DIBBUR_NIKUD = "בראשית";
const RASHI_TEXT_NIKUD = "אָמַר רַבִּי יִצְחָק לֹא הָיָה צָרִיךְ לְהַתְחִיל אֶת הַתּוֹרָה אֶלָּא מֵהַחֹדֶשׁ הַזֶּה לָכֶם, שֶׁהִיא מִצְוָה רִאשׁוֹנָה שֶׁנִּצְטַוּוּ בָּהּ יִשׂרָאֵל …";
const ENGLISH = "In the beginning Elohim created the heavens and the earth.";

// As written in the app (AliyahReaderView.aliyahNames)
const ALIYOT = ['כהן', 'לוי', 'שלישי', 'רביעי', 'חמישי', 'ששי', 'שביעי'];

// ── Pieces ───────────────────────────────────────────────────────────────────

function Label({ children, color = GOLD_DEEP }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.32em]" style={{ ...LABEL_FONT, color }}>
      {children}
    </p>
  );
}

function He({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span lang="he" dir="rtl" className={`font-hebrew ${className}`}>
      {children}
    </span>
  );
}

function ArrowLink({ href, children, color }: { href: string; children: React.ReactNode; color: string }) {
  return (
    <Link
      href={href}
      className={`${styles.arrowLink} inline-flex items-center gap-2 text-[15px] font-medium`}
      style={{ ...LABEL_FONT, color }}
    >
      <span className={styles.underline}>{children}</span>
      <span className={styles.arrow} aria-hidden>→</span>
    </Link>
  );
}

function AppStoreBadge({ align = 'start' }: { align?: 'start' | 'center' }) {
  // Official Apple badge, unmodified. Apple's minimum on-screen height is 40px.
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/badges/download-on-the-app-store.svg"
      alt="Download on the App Store"
      width={162}
      height={54}
      className="h-[48px] w-auto sm:h-[54px]"
    />
  );
  return (
    <div className={`flex flex-col gap-2 ${align === 'center' ? 'items-center' : 'items-start'}`}>
      {APP_STORE_URL ? (
        <a href={APP_STORE_URL} className={styles.badge}>
          {img}
        </a>
      ) : (
        <>
          <div className={styles.badge}>{img}</div>
          <span className="text-[11px] uppercase tracking-[0.28em]" style={{ ...LABEL_FONT, color: MUTED_ON_NAVY }}>
            Coming soon
          </span>
        </>
      )}
    </div>
  );
}

// A real screenshot in a phone frame, or the typeset fallback when none exists yet
function ProductShot({ src, alt, fallback }: { src: string | null; alt: string; fallback: React.ReactNode }) {
  if (!src) return <>{fallback}</>;
  return (
    <div
      className="mx-auto w-[min(78vw,330px)] overflow-hidden rounded-[2.6rem] border-[10px] shadow-[0_40px_80px_-30px_rgba(13,27,42,0.55)] sm:w-[340px]"
      style={{ borderColor: NAVY_DEEP, background: NAVY_DEEP }}
    >
      <Image src={src} alt={alt} width={1290} height={2796} className="h-auto w-full" sizes="340px" />
    </div>
  );
}

// Bereishit 1:1 laid out the way the app's reader does it (AliyahReaderView.PasukRow):
// the pasuk twice — large, then medium — then Onkelos in blue with a rule.
function TextSpecimen() {
  return (
    <figure
      className="relative mx-auto w-full max-w-[30rem] rounded-[1.75rem] px-7 pt-8 pb-10 sm:px-11 sm:pt-10 sm:pb-12 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.8)]"
      style={{ background: PARCHMENT }}
    >
      <div className="flex justify-end">
        <span
          className="rounded-full px-3 py-1 text-[12px] font-medium"
          style={{ ...LABEL_FONT, background: GOLD, color: BG_DARK }}
          lang="he"
        >
          א:א
        </span>
      </div>
      <div dir="rtl" lang="he" className="font-hebrew mt-4 space-y-4" style={{ color: INK }}>
        <p className="text-[1.75rem] leading-[1.65] sm:text-[2.1rem]">{PESUKIM[0]}</p>
        <p className="text-[1.4rem] leading-[1.65] sm:text-[1.6rem]">{PESUKIM[0]}</p>
        <p className="flex items-stretch gap-3 text-[1.2rem] leading-[1.7] sm:text-[1.4rem]" style={{ color: TARGUM_INK }}>
          <span className="w-[2px] shrink-0" style={{ background: 'rgba(38, 77, 157, 0.4)' }} aria-hidden />
          <span>{TARGUM}</span>
        </p>
      </div>
    </figure>
  );
}

// "Today's aliyah": the week's parsha with the app's ✦ ✦ ✦ ornament
// (HomePickerView.ornamentDivider) and the day's aliyah set apart
function AliyahToday() {
  return (
    <div className="mx-auto w-full max-w-[30rem] text-center">
      <He className="block text-[3.4rem] leading-tight sm:text-[4.5rem]">
        <span style={{ color: INK }}>בראשית</span>
      </He>
      <div className="mx-auto mt-7 flex max-w-[280px] items-center gap-4" aria-hidden>
        <span className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${GOLD}80)` }} />
        <span className="text-[9px] tracking-[0.45em]" style={{ color: GOLD }}>✦ ✦ ✦</span>
        <span className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${GOLD}80)` }} />
      </div>
      <div dir="rtl" lang="he" className="font-hebrew mt-9 flex flex-wrap justify-center gap-x-5 gap-y-3 text-[1.25rem] sm:text-[1.4rem]">
        {ALIYOT.map((a, i) => (
          <span
            key={a}
            className={i === 3 ? 'border-b-2 pb-1' : ''}
            style={i === 3 ? { color: INK, borderColor: GOLD } : { color: FAINT }}
          >
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}

// Seven aliyot, four complete
function ProgressMarks() {
  return (
    <ol dir="rtl" lang="he" className="mx-auto w-full max-w-[22rem] font-hebrew">
      {ALIYOT.map((a, i) => {
        const done = i < 4;
        return (
          <li
            key={a}
            className="flex items-center justify-between border-b py-[0.85rem] text-[1.3rem] last:border-b-0"
            style={{ borderColor: RULE, color: done ? INK : FAINT }}
          >
            <span>{a}</span>
            <span
              className="h-[11px] w-[11px] rotate-45"
              style={done ? { background: GOLD } : { border: `1.5px solid ${RULE}` }}
              aria-label={done ? 'complete' : 'not yet'}
            />
          </li>
        );
      })}
    </ol>
  );
}

// A few pesukim with a ribbon marking where reading stopped
function BookmarkPage() {
  return (
    <figure className="relative mx-auto w-full max-w-[30rem] rounded-[1.5rem] px-8 pt-28 pb-10 sm:px-12" style={{ background: PARCHMENT }}>
      <span
        aria-hidden
        className="absolute -top-3 left-10 h-24 w-6 sm:left-14"
        style={{ background: GOLD, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)' }}
      />
      <div dir="rtl" lang="he" className="font-hebrew space-y-5 text-[1.3rem] leading-[1.85] sm:text-[1.5rem]">
        {PESUKIM.map((p, i) => (
          <p key={p} style={{ color: i === 2 ? INK : FAINT }}>
            {p}
          </p>
        ))}
      </div>
    </figure>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  // Supabase email links without a redirectTo land on the Site URL (this page).
  // Hand any auth code to the callback so the user still ends up in the app.
  const { code } = await searchParams;
  if (code) redirect(`/auth/callback?code=${encodeURIComponent(code)}`);

  const reveal = styles.reveal;

  return (
    <main className={`${body.className} overflow-x-clip`} style={{ background: PARCHMENT, color: INK }}>
      <ScrollReveal />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] flex-col" style={{ background: BG_DARK }}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-7 sm:px-10 sm:pt-9">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/apple-touch-icon.png" alt="" width={36} height={36} className="rounded-[9px]" priority />
            <span className="text-[11px] font-medium uppercase tracking-[0.32em]" style={{ ...LABEL_FONT, color: AMBER }}>
              Shnayim Mikra
            </span>
          </Link>
          <Link
            href="/app"
            className="text-[13px] transition-opacity hover:opacity-75"
            style={{ ...LABEL_FONT, color: MUTED_ON_NAVY }}
          >
            Web App
          </Link>
        </div>

        <div className="mx-auto grid w-full max-w-7xl flex-1 content-center items-center gap-20 px-6 pt-20 pb-28 sm:px-10 sm:pt-28 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
          <div>
            <h1
              className={`${display.className} ${styles.enter} text-[3.1rem] font-medium leading-[1.02] tracking-[-0.01em] sm:text-[4.75rem] lg:text-[5.6rem]`}
              style={{ color: PARCHMENT }}
            >
              Shnayim Mikra, beautifully done.
            </h1>
            <div className={`${styles.enter} mt-10 sm:mt-12`} style={{ ['--delay' as string]: '0.15s' }}>
              <p className="text-lg sm:text-xl" style={{ color: MUTED_ON_NAVY }}>
                A focused, thoughtfully designed way to complete
              </p>
              <p className="mt-3">
                <He className="whitespace-nowrap text-[1.9rem] font-bold leading-snug sm:text-[2.6rem]">
                  <span style={{ color: PARCHMENT }}>שנים מקרא ואחד תרגום</span>
                </He>
              </p>
              <p className="mt-2 text-lg sm:text-xl" style={{ color: MUTED_ON_NAVY }}>
                every week.
              </p>
            </div>
            <div
              className={`${styles.enter} mt-12 flex flex-col items-start gap-8 sm:mt-14 sm:flex-row sm:items-center sm:gap-10`}
              style={{ ['--delay' as string]: '0.3s' }}
            >
              <AppStoreBadge />
              <ArrowLink href="/app" color={PARCHMENT}>
                Use Shnayim Mikra on the web
              </ArrowLink>
            </div>
          </div>

          <div className={styles.enter} style={{ ['--delay' as string]: '0.45s' }}>
            <div className={styles.float}>
              <ProductShot src={SCREENSHOTS.hero} alt="Shnayim Mikra reader on iPhone" fallback={<TextSpecimen />} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Today's aliyah ───────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-32 sm:px-10 sm:py-44 lg:grid-cols-2 lg:gap-24">
        <div data-reveal className={reveal}>
          <h2 className={`${display.className} text-[2.6rem] font-semibold leading-[1.08] sm:text-[3.4rem]`} style={{ color: INK }}>
            Open today&apos;s aliyah and start reading.
          </h2>
          <p className="mt-8 text-lg leading-[1.8] sm:text-[1.2rem]">
            No hunting for your place. No figuring out where you were up to.
          </p>
          <p className="mt-5 text-lg leading-[1.8] sm:text-[1.2rem]" style={{ color: MUTED }}>
            Shnayim Mikra brings you directly into the week&apos;s reading and keeps the experience focused on
            the text.
          </p>
        </div>
        <div data-reveal className={`${reveal} ${styles.parallax}`} style={{ ['--delay' as string]: '0.12s' }}>
          <ProductShot src={SCREENSHOTS.aliyah} alt="Choosing today's aliyah in Shnayim Mikra" fallback={<AliyahToday />} />
        </div>
      </section>

      {/* ── Progress ─────────────────────────────────────────────────────── */}
      <section className="border-t" style={{ borderColor: RULE }}>
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-32 sm:px-10 sm:py-44 lg:grid-cols-2 lg:gap-24">
          <div data-reveal className={`${reveal} lg:order-2`}>
            <h2 className={`${display.className} text-[2.6rem] font-semibold leading-[1.08] sm:text-[3.4rem]`} style={{ color: INK }}>
              Your progress, remembered.
            </h2>
            <p className="mt-8 text-lg leading-[1.8] sm:text-[1.2rem]" style={{ color: MUTED }}>
              Shnayim Mikra keeps track of what you&apos;ve completed aliyah by aliyah, so you can come back later
              and continue where you left off.
            </p>
          </div>
          <div data-reveal className={`${reveal} lg:order-1`} style={{ ['--delay' as string]: '0.12s' }}>
            <ProductShot src={SCREENSHOTS.progress} alt="Aliyah-by-aliyah progress in Shnayim Mikra" fallback={<ProgressMarks />} />
          </div>
        </div>
      </section>

      {/* ── Bookmarks ────────────────────────────────────────────────────── */}
      <section style={{ background: BG_DARK }}>
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-32 sm:px-10 sm:py-44 lg:grid-cols-2 lg:gap-24">
          <div data-reveal className={reveal}>
            <h2 className={`${display.className} text-[2.6rem] font-semibold leading-[1.08] sm:text-[3.4rem]`} style={{ color: PARCHMENT }}>
              Leave a bookmark. Come right back.
            </h2>
            <p className="mt-8 text-lg leading-[1.8] sm:text-[1.2rem]" style={{ color: MUTED_ON_NAVY }}>
              When you stop in the middle of an aliyah, leave a bookmark and return directly to your place.
            </p>
          </div>
          <div data-reveal className={`${reveal} ${styles.parallax}`} style={{ ['--delay' as string]: '0.12s' }}>
            <ProductShot src={SCREENSHOTS.bookmark} alt="A bookmark in the Shnayim Mikra reader" fallback={<BookmarkPage />} />
          </div>
        </div>
      </section>

      {/* ── Reading experience ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-32 text-center sm:px-10 sm:py-48">
        <div data-reveal className={reveal}>
          <h2 className={`${display.className} text-[3rem] font-semibold leading-[1.05] sm:text-[4.5rem]`} style={{ color: INK }}>
            Made for reading.
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-[1.8] sm:text-[1.2rem]" style={{ color: MUTED }}>
            Beautiful Hebrew typography and a focused reader designed around the text itself.
          </p>
        </div>

        <div data-reveal className={`${reveal} mt-20 sm:mt-28`} style={{ ['--delay' as string]: '0.1s' }}>
          {SCREENSHOTS.reader ? (
            <ProductShot src={SCREENSHOTS.reader} alt="The Shnayim Mikra reader" fallback={null} />
          ) : (
            <ReaderDemo
              text={{
                ref: 'א:א',
                mikra: PESUKIM[0],
                targum: TARGUM,
                rashiDibbur: RASHI_DIBBUR_NIKUD,
                rashiText: RASHI_TEXT_NIKUD,
                english: ENGLISH,
              }}
            />
          )}
          <p className="mx-auto mt-8 max-w-xl text-[15px] leading-[1.8]" style={{ color: MUTED }}>
            Each pasuk twice in Hebrew, then Targum Onkelos.
          </p>
        </div>

        <ul className="mx-auto mt-24 max-w-3xl text-left sm:mt-32">
          {[
            ['Rashi, your way.', 'Read Rashi in Rashi script or in block letters, and show Rashi script with or without nikud.'],
            ['English translation.', 'An English translation of every pasuk, one tap away.'],
            ['Light and dark.', "Parchment by day, deep navy by night, or follow your iPhone's setting."],
          ].map(([title, line], i) => (
            <li
              key={title}
              data-reveal
              className={`${reveal} grid gap-2 border-t py-8 sm:grid-cols-[15rem_1fr] sm:gap-10 sm:py-10`}
              style={{ borderColor: RULE, ['--delay' as string]: `${i * 0.08}s` }}
            >
              <span className={`${display.className} text-[1.6rem] font-semibold leading-tight sm:text-[1.75rem]`} style={{ color: INK }}>
                {title}
              </span>
              <span className="text-lg leading-[1.75]" style={{ color: MUTED }}>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Weekly ───────────────────────────────────────────────────────── */}
      <section className="border-t" style={{ borderColor: RULE }}>
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-32 sm:px-10 sm:py-44 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <h2
            data-reveal
            className={`${reveal} ${display.className} text-[2.6rem] font-semibold leading-[1.08] sm:text-[3.4rem]`}
            style={{ color: INK }}
          >
            Built around the week.
          </h2>
          <div data-reveal className={reveal} style={{ ['--delay' as string]: '0.1s' }}>
            <ul className="text-[1.15rem] sm:text-[1.25rem]">
              {[
                'The right parsha.',
                'The right aliyos.',
                'Israel and Diaspora calendars.',
                'Single and double parshiyot handled correctly.',
              ].map((line) => (
                <li key={line} className="flex items-baseline gap-4 border-b py-5" style={{ borderColor: RULE, color: INK }}>
                  <span className="h-[7px] w-[7px] shrink-0 -translate-y-[3px] rotate-45" style={{ background: GOLD }} aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-10 text-lg leading-[1.8]" style={{ color: MUTED }}>
              Your progress stays organized from one Torah-reading cycle to the next.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section style={{ background: BG_DARK }}>
        <div className="mx-auto max-w-4xl px-6 py-40 text-center sm:px-10 sm:py-56">
          <div data-reveal className={reveal}>
            <h2 className={`${display.className} text-[2.9rem] font-medium leading-[1.05] sm:text-[4.75rem]`} style={{ color: PARCHMENT }}>
              Make Shnayim Mikra part of the week.
            </h2>
            <p className="mt-10 text-lg sm:text-xl" style={{ color: MUTED_ON_NAVY }}>
              Less figuring out where you left off.
            </p>
            <p className="mt-3 text-lg sm:text-xl" style={{ color: MUTED_ON_NAVY }}>
              More{' '}
              <He className="text-[1.6rem] font-bold sm:text-[1.9rem]">
                <span style={{ color: PARCHMENT }}>שנים מקרא</span>
              </He>
              .
            </p>
          </div>
          <div data-reveal className={`${reveal} mt-16 flex flex-col items-center gap-8`} style={{ ['--delay' as string]: '0.12s' }}>
            <AppStoreBadge align="center" />
            <ArrowLink href="/app" color={PARCHMENT}>
              Continue on the web
            </ArrowLink>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ ...LABEL_FONT, background: NAVY_DEEP, color: MUTED_ON_NAVY }}>
        <div className="mx-auto max-w-6xl px-6 py-14 text-[13px] sm:px-10">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <p style={{ color: PARCHMENT }}>Shnayim Mikra by COR Solutions</p>
              <p>COR Solutions is operated by COR Therapy LLC.</p>
            </div>
            <nav className="flex gap-8">
              <Link href="/app" className="transition-opacity hover:opacity-75" style={{ color: PARCHMENT }}>Web App</Link>
              <Link href="/privacy" className="transition-opacity hover:opacity-75" style={{ color: PARCHMENT }}>Privacy</Link>
              <Link href="/support" className="transition-opacity hover:opacity-75" style={{ color: PARCHMENT }}>Support</Link>
            </nav>
          </div>
          <p className="mt-12 max-w-2xl text-[11px] leading-relaxed" style={{ color: 'rgba(242, 234, 208, 0.40)' }}>
            English translation from{' '}
            <a href="https://www.sefaria.org/Genesis.1.1?ven=Metsudah_Chumash,_Metsudah_Publications,_2009" className="underline underline-offset-2 hover:opacity-80">
              Metsudah Chumash, Metsudah Publications, 2009
            </a>
            , available on Sefaria.org and licensed as CC BY.
            Digitization by Sefaria. Reformatted by Shnayim Mikra.
          </p>
          <p className="mt-3 max-w-2xl text-[11px] leading-relaxed" style={{ color: 'rgba(242, 234, 208, 0.40)' }}>
            Apple and the Apple logo are trademarks of Apple Inc., registered in the U.S. and other countries
            and regions. App Store is a service mark of Apple Inc.
          </p>
        </div>
      </footer>
    </main>
  );
}
