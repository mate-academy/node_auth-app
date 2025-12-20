import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-primary">
            Auth App
          </Link>

          <nav className="flex items-center gap-2 text-sm">
            {user ? (
              <>
                <span className="text-slate-600">Привіт, {user.name || 'користувачу'}</span>
                <Link to="/profile" className="btn-secondary h-9">
                  Профіль
                </Link>
                <button type="button" className="btn-primary h-9" onClick={logout}>
                  Вийти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary h-9">
                  Увійти
                </Link>
                <Link to="/register" className="btn-primary h-9">
                  Реєстрація
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
