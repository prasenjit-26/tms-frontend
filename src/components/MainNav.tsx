import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

type MenuItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

const menuItems: MenuItem[] = [
  { label: 'Dashboard', href: '/shipments' },
  {
    label: 'Shipments',
    children: [
      { label: 'All Shipments', href: '/shipments' },
      { label: 'Pending', href: '/shipments?status=PENDING' },
      { label: 'In Transit', href: '/shipments?status=IN_TRANSIT' },
      { label: 'Delivered', href: '/shipments?status=DELIVERED' },
    ],
  },
  {
    label: 'Reports',
    children: [
      { label: 'Overview', href: '/shipments' },
      { label: 'Analytics', href: '/shipments' },
    ],
  },
  { label: 'Settings', href: '/shipments' },
];

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="relative h-5 w-6">
      <span
        className={`absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300 ${
          open ? 'top-2.5 rotate-45' : 'top-0.5'
        }`}
      />
      <span
        className={`absolute left-0 top-2.5 block h-0.5 w-6 bg-current transition-opacity duration-300 ${
          open ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        className={`absolute left-0 block h-0.5 w-6 bg-current transition-all duration-300 ${
          open ? 'top-2.5 -rotate-45' : 'top-[18px]'
        }`}
      />
    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function DesktopNav() {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {menuItems.map((item) => {
        const isActive = item.href === location.pathname;
        const hasChildren = item.children && item.children.length > 0;

        if (hasChildren) {
          return (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  openDropdown === item.label
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openDropdown === item.label ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === item.label && (
                <div className="absolute left-0 top-full z-50 min-w-[180px] pt-1">
                  <div className="rounded-xl border border-white/10 bg-slate-900 p-1 shadow-xl shadow-black/40">
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            to={item.href ?? '/'}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-white'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-lg font-bold text-transparent">
            TMS
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-2">
          {menuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openSubmenu === item.label;

            if (hasChildren) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setOpenSubmenu(isOpen ? null : item.label)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="ml-3 border-l border-white/10 pl-3">
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={onClose}
                          className="block rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.href ?? '/'}
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function MainNav() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
            >
              <HamburgerIcon open={false} />
            </button>

            <Link
              to="/shipments"
              className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-xl font-bold tracking-tight text-transparent"
            >
              TMS
            </Link>

            <DesktopNav />
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user && (
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-xs font-bold text-white">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-slate-200">{user.email}</div>
                  <div className="text-xs text-slate-500">
                    {user.role === 'admin' ? '🛡️ Admin' : '👤 Employee'}
                  </div>
                </div>
              </div>
            )}

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
