"use client";

import { api } from "@/app/lib/api";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthLinkError from "@/app/components/auth-link-error";
import { useQueryClient } from "@tanstack/react-query";

function ActivateNewEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activateToken = searchParams.get("activateToken");

  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!activateToken) return;

    let cancelled = false;

    api
      .get(
        `/api/auth/activate-new-email?activateToken=${encodeURIComponent(activateToken)}`,
      )
      .then(() => {
        if (!cancelled) {
          router.replace("/profile");
          queryClient.invalidateQueries({ queryKey: ["user"] });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (axios.isAxiosError(err) && err.response?.status === 400) {
          setError(
            "This email confirmation link has expired or is invalid. Update your email again from profile.",
          );
          return;
        }
        setError("Something went wrong. Please try again later.");
      });

    return () => {
      cancelled = true;
    };
  }, [activateToken, router, queryClient]);

  if (!activateToken) {
    return (
      <AuthLinkError
        title="Confirmation link invalid"
        description="The email confirmation link is missing. Update your email from profile to get a new link."
        primaryHref="/profile"
        primaryLabel="Go to profile"
      />
    );
  }

  if (error) {
    return (
      <AuthLinkError
        title="Email confirmation failed"
        description={error}
        primaryHref="/profile"
        primaryLabel="Go to profile"
      />
    );
  }

  return (
    <p className="text-center text-sm text-rose-100/75">
      Confirming your new email…
    </p>
  );
}

export default function ActivateNewEmaiPage() {
  return <ActivateNewEmailContent />;
}
