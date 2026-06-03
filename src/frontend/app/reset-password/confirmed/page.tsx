"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import AuthLinkError from "@/app/components/auth-link-error";
import { api } from "@/app/lib/api";
import { getApiErrorBody, getApiErrorMessage } from "@/app/lib/api-errors";
import { ChangePasswordSchema } from "@/app/lib/shema";
import { formInputClass as inputClass } from "@/app/lib/form-styles";
import { FieldError } from "@/app/components/field-error";
import { ProfilePanel } from "@/app/components/profile-panel";
import { toast } from "sonner";

type ResetPasswordInput = z.infer<typeof ChangePasswordSchema>;

const buttonClass =
  "w-full cursor-pointer rounded-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(244,63,94,0.35)] transition hover:from-rose-500 hover:to-fuchsia-500 disabled:opacity-60";

function ResetPasswordConfirmedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetToken = searchParams.get("resetToken");
  const [fatalError, setFatalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  async function onSubmit(data: ResetPasswordInput) {
    if (!resetToken) {
      setFatalError(
        "This reset link is missing or invalid. Request a new one from the sign-in page.",
      );
      return;
    }

    try {
      const { data: result } = await api.post(
        "/api/auth/reset-password/confirmed",
        {
          resetToken,
          newPassword: data.newPassword,
        },
      );

      if (result?.statusCode !== 200 && result?.message !== "ok") {
        toast.warning("Could not reset password. Please try again.");
        return;
      }

      reset();
      router.replace("/reset-password/success");
    } catch (error: unknown) {
      const body = getApiErrorBody(error);
      if (body?.code === "INVALID_RESET_TOKEN") {
        setFatalError(
          "This reset link has expired or is invalid. Request a new one and try again.",
        );
        return;
      }
      toast.warning(
        getApiErrorMessage(error, "Could not reset password. Please try again."),
      );
    }
  }

  if (!resetToken) {
    return (
      <AuthLinkError
        title="Reset link invalid"
        description="This reset link is missing. Request a new one from the sign-in page."
        primaryHref="/reset-password"
        primaryLabel="Request reset link"
      />
    );
  }

  if (fatalError) {
    return (
      <AuthLinkError
        title="Reset link invalid"
        description={fatalError}
        primaryHref="/reset-password"
        primaryLabel="Request reset link"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <ProfilePanel
        title="Set new password"
        description="Choose a strong password with uppercase, lowercase, number, and symbol."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="New password"
              className={inputClass}
              autoComplete="new-password"
              {...register("newPassword")}
            />
            <FieldError message={errors.newPassword?.message} />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm new password"
              className={inputClass}
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            <FieldError message={errors.confirmPassword?.message} />
          </div>
          <button type="submit" disabled={isSubmitting} className={buttonClass}>
            {isSubmitting ? "Saving..." : "Save new password"}
          </button>
        </form>
      </ProfilePanel>
    </div>
  );
}

export default function ResetPasswordConfirmedPage() {
  return <ResetPasswordConfirmedContent />;
}
