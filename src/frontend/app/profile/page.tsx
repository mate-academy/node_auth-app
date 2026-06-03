"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUser } from "../hooks/useUser";
import {
  ProfileEmailSchema,
  ProfileNameSchema,
  ProfilePasswordSchema,
} from "../lib/shema";
import { api } from "../lib/api";
import { getApiErrorBody, getApiErrorMessage } from "../lib/api-errors";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { FieldError } from "../components/field-error";
import { ProfilePanel } from "../components/profile-panel";
import {
  formInputClass as inputClass,
  surfacePanelClass,
} from "../lib/form-styles";

const buttonClass =
  "w-full cursor-pointer rounded-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(244,63,94,0.35)] transition hover:from-rose-500 hover:to-fuchsia-500 disabled:opacity-60";

type ProfileNameInput = z.infer<typeof ProfileNameSchema>;
type ProfileEmailInput = z.infer<typeof ProfileEmailSchema>;
type ProfilePasswordInput = z.infer<typeof ProfilePasswordSchema>;

function UpdateNameForm({ defaultName }: { defaultName?: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileNameInput>({
    resolver: zodResolver(ProfileNameSchema),
    defaultValues: { name: defaultName ?? "" },
  });
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  useEffect(() => {
    if (defaultName) reset({ name: defaultName });
  }, [defaultName, reset]);

  async function onSubmit(data: ProfileNameInput) {
    if (!user?.id || data.name === user.name) return;

    try {
      const { data: updatedUser } = await api.put("/api/user/update-user-data", {
        newName: data.name,
      });
      if (!updatedUser?.id) {
        toast.warning("Error during change name. Please try again");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Name updated successfully");
    } catch {
      toast.warning("Error during change name. Please try again");
    }
  }

  return (
    <ProfilePanel
      title="Name"
      description="Change how your name appears in the app."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Name"
            className={inputClass}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <button type="submit" disabled={isSubmitting} className={buttonClass}>
          {isSubmitting ? "Saving..." : "Save name"}
        </button>
      </form>
    </ProfilePanel>
  );
}

function UpdateEmailForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEmailInput>({
    resolver: zodResolver(ProfileEmailSchema),
  });
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  async function onSubmit(data: ProfileEmailInput) {
    if (!user?.id) {
      toast.warning("Please sign in to update your email");
      return;
    }

    if (data.email === user.email) return;

    try {
      const { data: result } = await api.put("/api/user/update-user-data", {
        newEmail: data.email,
        confirmNewEmail: data.confirmEmail,
        password: data.password,
      });

      if (result?.statusCode !== 200 && result?.message !== "ok") {
        toast.warning("Error during change email. Please try again");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.info(
        `A verification email has been sent to ${data.email}. Please verify your new email address.`,
      );
      reset();
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "Error during change email. Please try again",
      );
      const body = getApiErrorBody(error);
      if (body?.code === "INVALID_PASSWORD") {
        setError("password", { message: "Incorrect password" });
      }
      if (
        body?.message?.toLowerCase().includes("match") ||
        body?.message === "Emails do not match"
      ) {
        setError("confirmEmail", { message: "Emails do not match" });
      }
      toast.warning(message);
    }
  }

  return (
    <ProfilePanel
      title="Email"
      description="After updating your email address, you'll need to verify the new address before the change takes effect."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="password"
            placeholder="Enter your password"
            className={inputClass}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>
        <div>
          <input
            type="email"
            placeholder="New email"
            className={inputClass}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <input
            type="email"
            placeholder="Confirm new email"
            className={inputClass}
            {...register("confirmEmail")}
          />
          <FieldError message={errors.confirmEmail?.message} />
        </div>
        <button type="submit" disabled={isSubmitting} className={buttonClass}>
          {isSubmitting ? "Updating..." : "Update email"}
        </button>
      </form>
    </ProfilePanel>
  );
}

function UpdatePasswordForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfilePasswordInput>({
    resolver: zodResolver(ProfilePasswordSchema),
  });
  const { data: user } = useUser();

  async function onSubmit(data: ProfilePasswordInput) {
    if (!user?.id) {
      toast.warning("Please sign in to update your password");
      return;
    }

    try {
      const { data: result } = await api.put("/api/user/update-user-data", {
        password: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmPassword,
      });

      if (result?.statusCode !== 200 && result?.message !== "ok") {
        toast.warning("Error during change password. Please try again");
        return;
      }

      toast.success("Password was updated successfully");
      reset();
    } catch (error: unknown) {
      const message = getApiErrorMessage(
        error,
        "Error during change password. Please try again",
      );
      if (getApiErrorBody(error)?.code === "INVALID_PASSWORD") {
        setError("currentPassword", { message: "Incorrect password" });
      }
      toast.warning(message);
    }
  }

  return (
    <ProfilePanel
      title="Password"
      description="Use a strong password with uppercase, lowercase, number, and symbol."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="password"
            placeholder="Current password"
            className={inputClass}
            {...register("currentPassword")}
          />
          <FieldError message={errors.currentPassword?.message} />
        </div>
        <div>
          <input
            type="password"
            placeholder="New password"
            className={inputClass}
            {...register("newPassword")}
          />
          <FieldError message={errors.newPassword?.message} />
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm new password"
            className={inputClass}
            {...register("confirmPassword")}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>
        <button type="submit" disabled={isSubmitting} className={buttonClass}>
          {isSubmitting ? "Changing..." : "Change password"}
        </button>
      </form>
    </ProfilePanel>
  );
}

export default function ProfilePage() {
  const { data: user } = useUser();

  return (
    <section className={`mx-auto w-full max-w-3xl ${surfacePanelClass} p-6 sm:p-8`}>
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-rose-50">Profile</h2>
        {user?.name && (
          <p className="mt-2 text-sm text-rose-100/75">Hello, {user.name}</p>
        )}
        {user?.email && (
          <p className="mt-2 text-sm text-rose-100/75">{user.email}</p>
        )}
      </header>

      <div className="grid gap-5 sm:gap-6">
        <UpdateNameForm defaultName={user?.name} />
        <UpdateEmailForm />
        <UpdatePasswordForm />
      </div>
    </section>
  );
}
