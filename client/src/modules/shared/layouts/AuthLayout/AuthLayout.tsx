import { Link, Outlet, useLocation } from 'react-router-dom';

const RESTRICTED_ROUTES = ['/login', '/registration', '/auth'];

export const AuthLayout = () => {
  const location = useLocation();
  const rawFrom = location.state?.from;
  const path: string =
    typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname || '/';

  const backLink = RESTRICTED_ROUTES.some((route) => path.includes(route))
    ? '/'
    : path;

  return (
    <div className="min-h-screen w-full flex flex-col items-center  px-4 py-8">
      <Link
        to={`${backLink}`}
        className="inline-flex items-center self-start gap-2 mb-6 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors group"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:-translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Back</span>
      </Link>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};
