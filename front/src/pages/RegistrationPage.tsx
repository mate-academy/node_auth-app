import { useState } from "react";
import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Errors = {
  email: string | undefined;
  password: string | undefined;
  name: string | undefined;
};

type RegistrationResponse = {
  message?: string;
  user?: { id: string; name: string; email: string };
  errors?: Errors;
};

type Form = {
  name: string;
  email: string;
  password: string;
};

export default function RegistrationPage() {
  const [form, setForm] = useState<Form>({ name: "", email: "", password: "" });
  const [successMessage, setSuccessMessage] = useState<RegistrationResponse>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({
    name: "",
    email: "",
    password: "",
  });
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleForm(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  async function getActivationEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({
      name: "",
      email: "",
      password: "",
    });
    setGeneralError("");
    setSuccess(false);

    try {
      const BASE_URL = "http://localhost:3000";
      const response = await fetch(`${BASE_URL}/auth/registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data: RegistrationResponse = await response.json();

      if (response.status === 409) {
        setGeneralError("User is already exist");

        return;
      }

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }

        return;
      }

      setSuccessMessage({ message: data.message, user: data.user });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="Check your email"
        description="Your registration was successful"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-green-700">
            {successMessage?.message ??
              "An activation email has been sent to your email address."}
          </p>

          <div className="flex flex-col items-center gap-3">
            <a
              href="https://mail.google.com/mail/u/0/#inbox"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Open Gmail Inbox
            </a>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Enter your details below to get started"
    >
      {generalError && (
        <p className="text-sm text-red-600 text-center">{generalError}</p>
      )}
      <form className="space-y-5" onSubmit={getActivationEmail}>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>

          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            value={form.name}
            onChange={handleForm}
            required
            className="h-12 rounded-xl border-black/10 bg-white/70"
          />

          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>

          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
            value={form.email}
            onChange={handleForm}
            required
            className="h-12 rounded-xl border-black/10 bg-white/70"
          />

          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>

          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleForm}
            required
            className="h-12 rounded-xl border-black/10 bg-white/70"
          />

          <p className="text-xs text-muted-foreground">
            6–40 characters, at least one uppercase letter, at least 4 digits,
            one special character. No spaces or Cyrillic letters.
          </p>

          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-black text-white hover:bg-black/85"
        >
          {loading ? "Signing up…" : "Sign up"}
        </Button>

        <p className="text-center text-sm text-black/60">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-black underline underline-offset-4"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
