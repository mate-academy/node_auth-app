"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { LoginSchema } from "../lib/shema"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { api, resetSessionState } from "@/app/lib/api"
import { getApiErrorMessage } from "@/app/lib/api-errors"
import { formInputClass, surfaceFooterClass } from "@/app/lib/form-styles"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CredentialResponse, GoogleLogin } from "@react-oauth/google"


type LoginInput = z.infer<typeof LoginSchema>

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(data: LoginInput) {
    setFormError(null);
    try {
      resetSessionState();
      const { data: user } = await api.post("/api/auth/sign-in", data);

      if (user?.activationToken) {
        toast.info("Please activate your email before signing in.");
        router.push("/activate-email");
        return;
      }

      if (user?.id) {
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        router.push("/profile");
        return;
      }

      setFormError("Sign-in failed. Please try again.");
      toast.error("Sign-in failed. Please try again.");
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "Invalid email or password. Please try again.",
      );
      setFormError(message);
      toast.error(message);
    }
  }


  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }

    try {
      resetSessionState();
      const { data: user } = await api.post("/api/auth/google", { idToken });

      if (user?.id) {
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        router.push("/profile");
        return;
      }

      toast.error("Google sign-in failed. Please try again.");
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(error, "Google sign-in failed. Please try again."),
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h2 className="mb-1 text-2xl font-semibold text-rose-50">Sign In</h2>
      <p className="mb-6 text-sm text-rose-100/75">
        Welcome back. Enter your credentials to continue.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            className={formInputClass}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-rose-300">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            className={formInputClass}
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-rose-300">{errors.password.message}</p>
          )}
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 px-4 py-3 font-semibold text-white shadow-[0_0_18px_rgba(244,63,94,0.35)] transition hover:from-rose-500 hover:to-fuchsia-500 disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className={`mt-6 ${surfaceFooterClass} px-4 py-3 text-sm text-rose-100/85 cursor-pointer`}>
        <p className="inline">Don't have an account yet? </p>
        <Link href="/sign-up" className="font-semibold text-rose-300 hover:text-rose-200">
          Go to sign up
        </Link>
      </div>
      <div className={`mt-6 ${surfaceFooterClass} px-4 py-3 text-sm text-rose-100/85 cursor-pointer`}>
        <p className="inline">Don't remember password?</p>
        <Link href="/reset-password" className="font-semibold text-rose-300 hover:text-rose-200">
          Reset password
        </Link>
      </div>

      <div className={`mt-6 ${surfaceFooterClass} px-4 py-3 text-sm text-rose-100/85 cursor-pointer`}>
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google sign-in was cancelled or failed.")} />
      </div>
    </div>
  )
}