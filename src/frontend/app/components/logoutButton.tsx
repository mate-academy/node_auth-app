"use client";

import { useUser } from "@/app/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/app/lib/api";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUser();

  if (isLoading || !user || !user.id) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await api.get("/api/auth/sign-out");
      queryClient.removeQueries({ queryKey: ["user"] });
      router.push("/sign-in");
      router.refresh();
    } catch(err){
      console.error(err)
    }
  };

  return (
      <button
        type="button"
        onClick={handleLogout}
        className="text-white w-fit cursor-pointer rounded-2xl border border-rose-700/35 bg-surface-panel p-6 text-center shadow-[inset_0_0_20px_rgba(244,63,94,0.14)] sm:p-8"
      >
        Sign out
      </button>
  );
}
