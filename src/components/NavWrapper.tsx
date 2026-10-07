'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from './TopNav';

export function NavWrapper() {
  const pathname = usePathname();
  if (['/', '/privacy', '/support', '/login', '/home_beta'].includes(pathname)) return null;
  return <TopNav />;
}
