import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthState } from '../../store/AuthContext';

export const MainLayout = () => {
  const { isAuthenticated } = useAuthState();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full flex justify-between items-center h-14 bg-slate-800 border-b px-4 font-bold">
        <Link to={'/'} className='h-10'>
          <img src="/src/assets/vite.svg" alt="" className='h-full object-contain' />
        </Link>
        {isAuthenticated ? (
          <Link to={'/profile'}>Account</Link>
        ) : (
          <Link to={'/login'} state={{ from: location }}>
            Login
          </Link>
        )}
      </header>
      <main className="container mx-auto px-4 py-6 flex-1 ">
        <Outlet />
      </main>
      <footer className="w-full h-14 bg-slate-900 border-t border-slate-800 flex items-center justify-center text-sm text-slate-400">
        @secured
      </footer>
    </div>
  );
};
