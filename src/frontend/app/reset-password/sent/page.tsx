import Link from "next/link";

export default function ResetPasswordSentEmail() {
  return (
    <div className="mx-auto w-full max-w-md flex flex-col items-center justify-center">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-600/25 to-fuchsia-700/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
        aria-hidden
      >
        <svg
          className="h-6 w-6 text-rose-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      </div>

      <h2 className="mb-1 text-2xl font-semibold tracking-tight text-rose-50">
        Check your inbox
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-rose-100/75 text-center">
        If an account with that email exists, we've sent a password reset link.

        Please check your inbox and follow the instructions to reset your password.
      </p>

      <div className="mt-6 space-y-3">
        <Link
          href="/sign-in"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-600/50 bg-gradient-to-r from-rose-600/90 to-fuchsia-600/90 px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_0_18px_rgba(244,63,94,0.25)] transition hover:from-rose-500 hover:to-fuchsia-500"
        >
          Go to sign in
        </Link>
        <Link
          href="/reset-password"
          className="flex w-full cursor-pointer items-center justify-center rounded-xl border border-rose-700/40 bg-surface-input px-4 py-3 text-center text-sm font-semibold text-rose-200 transition hover:border-rose-500/60 hover:bg-surface-hover hover:text-rose-50"
        >
          Use a different email
        </Link>
      </div>

    </div>
  );
}
