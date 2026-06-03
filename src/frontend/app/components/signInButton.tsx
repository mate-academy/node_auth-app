"use client";

import { useUser } from "@/app/hooks/useUser";
import { usePathname, useRouter } from "next/navigation";

export default function SignInButton() {
  const router = useRouter();
  const { data: user, isLoading } = useUser();
  const pathname = usePathname();

  if (isLoading || user?.id || pathname.includes('sign-in') || pathname.includes('sign-up')) {
    return null;
  }

  return (
      <button
        type="button"
        onClick={() => router.push('/sign-in')}
        className="text-white w-fit cursor-pointer rounded-2xl border border-rose-700/35 bg-surface-panel p-6 text-center shadow-[inset_0_0_20px_rgba(244,63,94,0.14)] sm:p-8"
      >
        Go to sign in
      </button>
  );
}
