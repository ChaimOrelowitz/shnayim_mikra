# Shnayim Mikra Tracker — Project Overview

## What this is
A tool for tracking Shnayim Mikra v'Echad Targum — the weekly Jewish practice of reading the Torah portion twice in Hebrew and once in Aramaic (Targum). Users track progress per aliyah (each parsha has 7 aliyot), per Hebrew year.

## Tech stack
- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Hosting:** Vercel (production), GitHub repo: ChaimOrelowitz/shnayim_mikra
- **Styling:** Tailwind CSS + custom fonts (SBL BibLit for Hebrew, Poppins for Latin)

## Environment variables
Stored in `.env.local` (not committed). Keys needed:
- `DATABASE_URL` — Supabase pooled connection
- `DIRECT_URL` — Supabase direct connection (for Prisma migrations)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Data model (Prisma)

### Profile
- `id` — matches Supabase auth UUID
- `email`, `firstName`, `lastName`
- `role` — USER or ADMIN
- `location` — CHUL (diaspora) or EY (Israel) — affects which parshiyot are shown (some weeks differ)
- `preferredView` — READER or CLASSIC

### Parsha
- 54 parshiyot, `order` 1–54
- `type` — SINGLE or COMBINED (e.g. Tazria-Metzora in some years)
- Has 7 `Aliyah` children

### Aliyah
- `number` 1–7 (1=Kohen, 2=Levi, 3–7=Shlishi through Shvi'i)
- Has many `Pasuk` (verses) with Hebrew text and Targum
- Has many `RashiComment` per pasuk

### UserAliyahProgress
- Tracks per user, per aliyah, per Hebrew year
- Fields: `done`, `mikra1`, `mikra2`, `targum`, `rashiReview`

### UserPasukProgress
- Tracks per user, per pasuk, per Hebrew year
- Fields: `done`, `mikra1`, `mikra2`, `targum`

## Routes
- `/` — Main tracker: list of all parshiyot with progress for the current year
- `/home_beta` — New picker UI (dark/gold theme): RTL sliders for Sefer, Parsha, Aliyah → GO navigates to reader
- `/aliyah/[id]` — Aliyah reader: shows pesukim with Hebrew + Targum, Rashi comments
- `/catchup` — Same as original `/` (sefarim progress screen)
- `/settings` — User settings (location, view mode)
- `/admin` — Admin panel (upload content, manage users)
- `/login` — Auth page

## Hebrew calendar
- `getCurrentParsha(location)` — returns this week's parsha name, empty string on Yom Tov weeks
- `getScheduleForYear(year, location)` — returns ordered list of parsha names for a Hebrew year
- `currentHebrewYear()` — returns current Hebrew year number
- Location affects schedule: Israel (EY) sometimes reads different parshiyot than diaspora (CHUL)

## Key components
- `HomePickerClient` — The new home_beta UI. RTL horizontal sliders (Sefer/Parsha/Aliyah), gold/dark theme, done circles on aliyot, GO button navigates to reader. Lives at `src/components/HomePickerClient.tsx`
- `ParshaList` — Original progress list UI
- `BottomNav` — Global bottom nav (old design, 3 tabs)
- `NavWrapper` — Wraps TopNav, hidden on `/login` and `/home_beta`

## iOS app (in progress)
- Planned: SwiftUI app connecting directly to Supabase using the Swift SDK
- Same Supabase project — shared auth and data with the website
- Target: same UI as home_beta (picker → reader flow)
- Xcode project will live in `/ios/` subfolder of this repo
- User signs in on website or app — same account, same progress

## Design language (home_beta)
- Background: `#0d1b2a` (dark navy)
- Gold: `#c8a850`
- Card background: `#f8f2e3` (cream)
- Card border: `#d4b88a`
- Hebrew font: SBL BibLit (loaded from `/public/fonts/SBL_BLit.ttf`)
- Section labels: `◇ LABEL ◇` in gold, tracking-widest
- Sliders: RTL (Bereishit on right, drag left to go forward), momentum + snap
- Bottom nav: 4 tabs — Home, Progress, Settings, Profile
