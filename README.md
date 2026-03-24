# Shnayim Mikra Tracker

A local-first web application for tracking your weekly **Shnayim Mikra v'Echad Targum** (שניים מקרא ואחד תרגום) progress.

## Features

- ✅ Track progress aliyah-by-aliyah
- ✅ Detailed pasuk-level tracking for each aliyah
- ✅ Upload and attach PDF files to individual aliyos
- ✅ Automatic progress synchronization (marking "Done" checks all sub-items)
- ✅ Clean, calm, mobile-friendly interface
- ✅ Fully local - no internet connection required
- ✅ SQLite database - all data stored locally

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS** for styling
- **Prisma** ORM
- **SQLite** database
- **Server Actions** for data mutations

## Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

## Installation & Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Set up the database:**

This single command will push the schema to SQLite and seed sample data:

```bash
npm run setup
```

Alternatively, you can run these steps separately:

```bash
# Push Prisma schema to create database
npm run db:push

# Seed the database with Parshat Bereishit
npm run db:seed
```

3. **Start the development server:**

```bash
npm run dev
```

4. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Home Page
- View all parshiyos in your library
- See completion status for each parsha
- Click on a parsha to view its aliyos

### Parsha Detail Page
- View all 7 aliyos for the selected parsha
- Toggle tracking for each aliyah:
  - **Done**: Marks the entire aliyah complete (auto-checks all sub-items)
  - **Mikra 1**: First reading
  - **Mikra 2**: Second reading
  - **Targum**: Aramaic translation
- Upload PDF files for each aliyah
- Open attached PDFs in a new tab
- Click "View details →" to see pasuk-by-pasuk breakdown

### Aliyah Detail Page
- See progress: "X of Y pesukim done"
- Track each individual pasuk
- Pesukim organized by perek (chapter)
- Toggle Done, Mikra 1, Mikra 2, and Targum for each pasuk

## Database Schema

### Parsha
- `id`: Unique identifier
- `name`: Parsha name (Hebrew)
- `order`: Numerical order in Torah
- `aliyos`: Relation to 7 aliyos

### Aliyah
- `id`: Unique identifier
- `number`: 1-7
- `pdfPath`: Optional path to uploaded PDF
- `done`, `mikra1`, `mikra2`, `targum`: Boolean progress flags
- `pesukim`: Relation to individual pesukim

### Pasuk
- `id`: Unique identifier
- `perek`: Chapter number
- `pasuk`: Verse number
- `done`, `mikra1`, `mikra2`, `targum`: Boolean progress flags

## Tracking Logic

### Automatic Synchronization
- **Checking "Done"**: Automatically checks Mikra 1, Mikra 2, and Targum
- **Unchecking any item**: Automatically unchecks "Done"
- **Checking all three items**: Automatically checks "Done"

This logic applies at both the aliyah level and pasuk level.

### Cascading Updates
When you check "Done" at the aliyah level, it cascades down to all pesukim in that aliyah.

## File Upload

- PDFs can be uploaded for each aliyah
- Files are stored in `public/uploads/`
- Maximum file size: 10MB
- Supported format: PDF only
- Files persist locally on your machine

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Push database schema changes
npm run db:push

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio

# Run linter
npm run lint
```

## Project Structure

```
shnayim-mikra-tracker/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts            # Seed script
│   └── dev.db             # SQLite database (auto-generated)
├── public/
│   └── uploads/           # PDF storage
├── src/
│   ├── app/
│   │   ├── actions.ts     # Server actions
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   ├── parsha/[id]/   # Parsha detail page
│   │   └── aliyah/[id]/   # Aliyah detail page
│   ├── components/
│   │   ├── AliyahCard.tsx    # Aliyah overview card
│   │   ├── PasukRow.tsx      # Individual pasuk row
│   │   ├── PDFUploader.tsx   # File upload component
│   │   └── Toggle.tsx        # Toggle switch component
│   └── lib/
│       ├── prisma.ts      # Prisma client
│       └── utils.ts       # Utility functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Customization

### Adding More Parshiyos

Edit `prisma/seed.ts` to add more parshiyos with their respective aliyos and pesukim.

### Styling

The app uses a warm, scholarly color palette defined in `tailwind.config.ts`:
- **Parchment**: Warm background tones
- **Ink**: Text colors
- **Sage**: Accent colors for interactive elements

Modify these in the Tailwind config to customize the theme.

## Database Management

### Reset Database

```bash
rm prisma/dev.db
npm run setup
```

### View Database in GUI

```bash
npm run db:studio
```

This opens Prisma Studio at http://localhost:5555

## Troubleshooting

### Port 3000 already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

Or run on a different port:
```bash
PORT=3001 npm run dev
```

### Database locked error
Close Prisma Studio if it's running, then restart the dev server.

### PDF upload fails
- Ensure `public/uploads/` directory exists
- Check file size is under 10MB
- Verify file is a valid PDF

## Future Enhancements (Phase 2+)

- Display actual pasuk text (not just tracking)
- Multiple parsha support with navigation
- Progress statistics and reports
- Export/import data
- Dark mode
- Offline PWA support
- Weekly parsha auto-selection

## License

MIT

## Author

Built for tracking weekly Torah study progress.
