import { UserMenu } from './UserMenu';

export function TopNav() {
  return (
    <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-parchment-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <span className="font-hebrew font-bold text-ink-900 text-lg tracking-tight">
          שניים מקרא
        </span>
        <UserMenu />
      </div>
    </nav>
  );
}
