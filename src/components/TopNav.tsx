import { UserMenu } from './UserMenu';

export function TopNav() {
  return (
    <nav className="sticky top-0 z-20" style={{ backgroundColor: '#1e3a8a' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <span className="font-hebrew font-bold text-white text-lg tracking-tight">
          שניים מקרא
        </span>
        <UserMenu dark />
      </div>
    </nav>
  );
}
