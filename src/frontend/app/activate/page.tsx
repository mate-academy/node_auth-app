"use client";

import { api } from "@/app/lib/api";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthLinkError from "@/app/components/auth-link-error";
import { useQueryClient } from "@tanstack/react-query";

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activateToken = searchParams.get("activateToken");

  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!activateToken) return;

    let cancelled = false;

    api
      .get(`/api/auth/activate?activateToken=${encodeURIComponent(activateToken)}`)
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
            "This activation link has expired or is invalid. Sign up again or request a new link.",
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
        title="Activation link invalid"
        description="The activation link is missing. Check your email or sign up again."
        primaryHref="/sign-up"
        primaryLabel="Back to sign up"
      />
    );
  }

  if (error) {
    return (
      <AuthLinkError
        title="Activation failed"
        description={error}
        primaryHref="/sign-up"
        primaryLabel="Back to sign up"
      />
    );
  }

  return (
    <p className="text-center text-sm text-rose-100/75">
      Activating your account…
    </p>
  );
}

export default function ActivatePage() {
  return <ActivateContent />;
}
