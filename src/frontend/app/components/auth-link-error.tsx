import Link from 'next/link';

interface AuthLinkErrorProps {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
}

export default function AuthLinkError({
  title = 'Invalid or expired link',
  description = 'This link is missing or has expired. Request a new one and try again.',
  primaryHref = '/sign-in',
  primaryLabel = 'Go to sign in',
}: AuthLinkErrorProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-600/25 to-fuchsia-700/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
        aria-hidden
      >
        <svg
          className="h-7 w-7 text-rose-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>

      <h2 className="mb-1 text-2xl font-semibold tracking-tight text-rose-50">
        {title}
      </h2>

      <p className="mb-6 text-sm leading-relaxed text-rose-100/75">
        {description}
      </p>

      <div className="w-full space-y-3">
        <Link
          href={primaryHref}
          className="flex w-full items-center justify-center rounded-xl border border-rose-600/50 bg-gradient-to-r from-rose-600/90 to-fuchsia-600/90 px-4 py-3 text-sm font-semibold text-white"
        >
          {primaryLabel}
        </Link>

        {primaryHref !== '/sign-in' && (
          <Link
            href="/sign-in"
            className="flex w-full items-center justify-center rounded-xl border border-rose-700/40 bg-surface-input px-4 py-3 text-sm font-semibold text-rose-200"
          >
            Go to sign in
          </Link>
        )}

        {primaryHref === '/sign-in' && (
          <Link
            href="/reset-password"
            className="flex w-full items-center justify-center rounded-xl border border-rose-700/40 bg-surface-input px-4 py-3 text-sm font-semibold text-rose-200"
          >
            Request a new reset link
          </Link>
        )}
      </div>
    </div>
  );
}
