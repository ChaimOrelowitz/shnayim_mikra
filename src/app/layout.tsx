import type { Metadata, Viewport } from 'next';
import { Crimson_Text } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/language';
import { LanguageToggle } from '@/components/LanguageToggle';

const crimsonText = Crimson_Text({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-crimson',
});

export const metadata: Metadata = {
  title: 'Shnayim Mikra Tracker',
  description: "Track your weekly Shnayim Mikra v'Echad Targum progress",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={crimsonText.variable}>
        <LanguageProvider>
          {children}
          <LanguageToggle />
        </LanguageProvider>
      </body>
    </html>
  );
}
