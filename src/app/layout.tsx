import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/language';
import { NavWrapper } from '@/components/NavWrapper';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
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
      <head />
      <body className={poppins.variable}>
        <LanguageProvider>
          <NavWrapper />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
