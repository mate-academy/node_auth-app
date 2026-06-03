import Link from "next/link";

export default function ResetPasswordSuccess() {
  return (
    <div className="mx-auto w-full max-w-md flex flex-col items-center justify-center">
      <h2 className="mb-1 text-2xl font-semibold tracking-tight text-rose-50 text-center">
        Your password was updated successfully!
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-rose-100/75 text-center">
        You can sign in with your new password.
      </p>

      <div className="mt-6 space-y-3">
        <Link
          href="/sign-in"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-600/50 bg-gradient-to-r from-rose-600/90 to-fuchsia-600/90 px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_0_18px_rgba(244,63,94,0.25)] transition hover:from-rose-500 hover:to-fuchsia-500"
        >
          Go to sign in
        </Link>
      </div>

    </div>
  );
}
