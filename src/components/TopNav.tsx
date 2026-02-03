import { Link } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

export function TopNav() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/shipments" className="font-semibold tracking-tight text-slate-100">
            TMS
          </Link>
          <span className="hidden text-xs text-slate-400 sm:inline">
            {user ? `${user.email} (${user.role})` : 'Not signed in'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button onClick={logout} className="bg-slate-900 hover:bg-slate-800">
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm font-medium hover:bg-slate-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
