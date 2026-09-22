export const HomePage = () => {
  return (
    <div className="mx-auto max-w-3xl py-12 text-center">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Authentication System
        </span>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Welcome to AuthSystem
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500">
          A simple and secure authentication platform for managing your account,
          profile and access.
        </p>
      </div>
    </div>
  );
};
