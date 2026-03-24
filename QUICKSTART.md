# Quick Start Guide

Get your Shnayim Mikra tracker running in 3 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

Wait for all packages to download (~2 minutes).

## Step 2: Setup Database

```bash
npm run setup
```

This creates your SQLite database and adds sample data.

## Step 3: Start the App

```bash
npm run dev
```

## Step 4: Open in Browser

Open [http://localhost:3000](http://localhost:3000)

You should see Parshat Bereishit with 7 aliyos ready to track!

---

## What You'll See

1. **Home Page** - List of parshiyos
2. **Click on "בראשית"** - See 7 aliyah cards
3. **Toggle switches** - Mark progress on each aliyah
4. **Upload PDF** - Attach reference materials
5. **View details** - Click to see pasuk-by-pasuk tracking

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run db:studio` | Open visual database editor |
| `npm run db:seed` | Reset to sample data |

---

## Troubleshooting

### Port 3000 already in use?

```bash
# Kill the process using port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port:
npm run dev -- -p 3001
```

### Database errors?

```bash
# Reset everything:
rm prisma/dev.db
npm run setup
```

### Module not found errors?

```bash
# Reinstall dependencies:
rm -rf node_modules package-lock.json
npm install
```

---

**That's it! You're ready to track your Shnayim Mikra.**

See README.md for full documentation.
