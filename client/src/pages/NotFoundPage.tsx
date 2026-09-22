import { Link } from 'react-router-dom';
export const NotFoundPage = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      {' '}
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        {' '}
        <div className="mb-6">
          {' '}
          <span className="text-7xl font-bold tracking-tight text-indigo-600">
            {' '}
            404{' '}
          </span>{' '}
        </div>{' '}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {' '}
          Page not found{' '}
        </h1>{' '}
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          {' '}
          Sorry, the page you are looking for does not exist or may have been
          moved.{' '}
        </p>{' '}
        <Link
          to="/"
          className="mt-7 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {' '}
          Back to home{' '}
        </Link>{' '}
      </div>{' '}
    </div>
  );
};
