# Complete Setup Guide

This guide will help you get the Shnayim Mikra Tracker running on your local machine.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18.x or higher** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A terminal/command prompt
- A code editor (VS Code recommended)

### Verify Node.js Installation

```bash
node -v   # Should show v18.x.x or higher
npm -v    # Should show npm version
```

## Installation Methods

### Method 1: Automated Setup (Recommended)

If you're on macOS or Linux, use the automated setup script:

```bash
cd shnayim-mikra-tracker
chmod +x setup.sh
./setup.sh
```

Then start the server:

```bash
npm run dev
```

### Method 2: Manual Setup

#### Step 1: Install Dependencies

```bash
cd shnayim-mikra-tracker
npm install
```

This will install:
- Next.js 15
- React 19
- Prisma & Prisma Client
- Tailwind CSS
- TypeScript
- And all other dependencies

#### Step 2: Initialize Database

```bash
npm run db:push
```

This creates the SQLite database file at `prisma/dev.db` with the schema defined in `prisma/schema.prisma`.

#### Step 3: Seed Sample Data

```bash
npm run db:seed
```

This populates the database with Parshat Bereishit:
- 7 aliyos
- ~70 pesukim across Perek 1 and Perek 2

#### Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Method 3: One-Command Setup

```bash
npm install && npm run setup
```

Then:

```bash
npm run dev
```

## Verifying Installation

After setup, you should see:

1. **Terminal output**:
   ```
   ✓ Ready in Xms
   ○ Local: http://localhost:3000
   ```

2. **Browser at localhost:3000**:
   - Home page showing "Parshat Bereishit"
   - Click through to see 7 aliyos
   - Each aliyah has tracking toggles

3. **Database file created**:
   ```bash
   ls prisma/dev.db  # Should exist
   ```

## First Use

1. **Navigate to the home page** - You'll see Parshat Bereishit listed
2. **Click on "בראשית"** - Opens the parsha detail page with 7 aliyah cards
3. **Try the toggles**:
   - Click "Done" on Aliyah 1 - All three sub-items auto-check
   - Uncheck "Mikra 1" - "Done" auto-unchecks
4. **Click "View details →"** on any aliyah - See pasuk-level tracking
5. **Upload a PDF**:
   - Click "Upload PDF" button
   - Select a PDF file (max 10MB)
   - File saves to `public/uploads/`
   - Click "Open PDF" to view in new tab

## Directory Structure

After setup, you'll have:

```
shnayim-mikra-tracker/
├── node_modules/          # Dependencies (created by npm install)
├── prisma/
│   ├── dev.db            # SQLite database (created by db:push)
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── public/
│   └── uploads/          # PDF upload storage
├── src/
│   ├── app/              # Next.js pages and routes
│   ├── components/       # React components
│   └── lib/              # Utilities
├── .next/                # Next.js build output (created by dev/build)
├── package.json          # Dependencies & scripts
└── README.md             # Documentation
```

## Development Workflow

### Daily Use

```bash
npm run dev              # Start the app
# Work in the app at localhost:3000
# Ctrl+C to stop
```

### Database Commands

```bash
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:push          # Push schema changes to database
npm run db:seed          # Re-seed data
```

### Reset Database

```bash
rm prisma/dev.db         # Delete database
npm run setup            # Recreate & seed
```

## Troubleshooting

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```bash
npm run db:push          # This generates the Prisma Client
```

### Issue: "Port 3000 already in use"

**Solution 1** - Kill the process:
```bash
lsof -ti:3000 | xargs kill -9
```

**Solution 2** - Use a different port:
```bash
PORT=3001 npm run dev
```

### Issue: "ENOENT: no such file or directory, open 'prisma/dev.db'"

**Solution:**
```bash
npm run db:push          # Creates the database
```

### Issue: Database is locked

**Solution:**
- Close Prisma Studio if running
- Stop all `npm run dev` processes
- Restart the dev server

### Issue: PDF upload fails

**Checks:**
1. File is a PDF
2. File is under 10MB
3. `public/uploads/` directory exists
   ```bash
   mkdir -p public/uploads
   ```

### Issue: npm install fails

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## Production Build

For a production-ready build:

```bash
npm run build            # Create optimized build
npm start                # Start production server
```

## Customization

### Add More Parshiyos

Edit `prisma/seed.ts` to add more parshiyos. Example:

```typescript
const noach = await prisma.parsha.create({
  data: {
    name: 'נח',
    order: 2,
    aliyos: {
      create: [
        {
          number: 1,
          pesukim: { create: [/* ... */] }
        },
        // ... 6 more aliyos
      ]
    }
  }
});
```

Then re-seed:
```bash
npm run db:seed
```

### Change Color Scheme

Edit `tailwind.config.ts`:

```typescript
colors: {
  parchment: { /* ... */ },
  ink: { /* ... */ },
  sage: { /* ... */ }
}
```

### Change Fonts

Edit `src/app/layout.tsx` to import different Google Fonts.

## Next Steps

- ✅ Track your weekly parsha progress
- ✅ Upload your tikun/chumash PDFs
- ✅ Use on mobile - it's fully responsive
- ✅ Add more parshiyos as needed
- ✅ Customize the design to your preference

## Support

For issues:
1. Check the troubleshooting section above
2. Review `README.md` for detailed documentation
3. Check the [Next.js docs](https://nextjs.org/docs)
4. Check the [Prisma docs](https://www.prisma.io/docs)

## License

MIT - Feel free to modify and customize for your needs.
