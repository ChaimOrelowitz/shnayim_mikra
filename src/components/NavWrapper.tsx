'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from './TopNav';

export function NavWrapper() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/home_beta') return null;
  return <TopNav />;
}
