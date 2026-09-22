export const EmailConfirmationPage = () => {
  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <span className="text-xl font-bold text-emerald-600">✓</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Email successfully changed
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          You can continue using your account.
        </p>
      </div>
    </div>
  );
};
