"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import PasswordRulesPopover from "../components/passwordRulesPopover"
import { formInputClass, surfaceFooterClass } from "../lib/form-styles"
import { SignUpSchema } from "../lib/shema"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/app/lib/api"
import { toast } from "sonner"


export type SignUpInput = z.infer<typeof SignUpSchema>

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
  })

  const passwordValue = watch("password") ?? ""
  const { ref: passwordRef, onBlur: passwordOnBlur, ...passwordRegister } =
    register("password")
  const router = useRouter();

  async function onSubmit(data: SignUpInput) {
    try {
      const response = await api.post("/api/auth/register", data);

      if (response.status !== 200) {
        toast.error("Error during sign up. Please, try again");
        return;
      }
      router.push("/activate-email");
    } catch {
      toast.error("Error during sign up. Please, try again");
    }

  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h2 className="mb-1 text-2xl font-semibold text-rose-50">Sign Up</h2>
      <p className="mb-6 text-sm text-rose-100/75">
        Create a new account to start using the app.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="text"
            required
            placeholder="Your Name"
            className={formInputClass}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-rose-300">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            required
            placeholder="Email"
            className={formInputClass}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-rose-300">{errors.email.message}</p>
          )}
        </div>

        <div>
          <PasswordRulesPopover password={passwordValue} inputId="signup-password">
            {({ id, onFocus, onBlur }) => (
              <input
                id={id}
                type="password"
                required
                placeholder="Password"
                autoComplete="new-password"
                className={formInputClass}
                {...passwordRegister}
                ref={passwordRef}
                onFocus={onFocus}
                onBlur={(e) => {
                  passwordOnBlur(e)
                  onBlur()
                }}
              />
            )}
          </PasswordRulesPopover>
          {errors.password && (
            <p className="mt-1 text-sm text-rose-300">{errors.password.message}</p>
          )}
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 px-4 py-3 font-semibold text-white shadow-[0_0_18px_rgba(244,63,94,0.35)] transition hover:from-rose-500 hover:to-fuchsia-500 disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div className={`mt-6 ${surfaceFooterClass} px-4 py-3 text-sm text-rose-100/85 cursor-pointer`}>
        <p className="inline">Already have an account? </p>
        <Link href="/sign-in" className="font-semibold text-rose-300 hover:text-rose-200">
          Go to sign in
        </Link>
      </div>
    </div>
  )
}