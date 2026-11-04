import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/PasswordInput";
import { useState, type FormEvent, type ChangeEvent } from "react";
import { useAuth } from "../AuthContext";
import { BASE_URL } from "@/api";

type Form = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [form, setForm] = useState<Form>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [inactive, setInactive] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  function handleFormEvent(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  }

  async function handleForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInactive(false);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        setInactive(response.status === 403);

        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
      navigate("/profile", { replace: true });
    } catch (error) {
      console.error(error);
      setError("Login failed");
    }
  }

  return (
    <AuthLayout
      title="Log in to your account"
      description="Enter your email and password below to log in"
    >
      <form className="space-y-6" onSubmit={handleForm}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-black/80">
            Email address
          </Label>

          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
            value={form.email}
            onChange={handleFormEvent}
            required
            className="h-12 rounded-xl border-black/10 bg-white/70 px-4 text-black placeholder:text-black/40 focus-visible:ring-black/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-black/80">
            Password
          </Label>

          <PasswordInput
            id="password"
            name="password"
            value={form.password}
            onChange={handleFormEvent}
            placeholder="Password"
            required
          />
        </div>

        {error && (
          <div className="space-y-1">
            <p className="text-sm text-red-600">{error}</p>
            {inactive && (
              <Link
                to="/reset"
                className="text-sm underline underline-offset-4"
              >
                Resend activation email
              </Link>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-black text-white hover:bg-black/85"
        >
          Log in
        </Button>

        <p className="pt-1 text-center text-sm text-black/60">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-black underline underline-offset-4 hover:text-black/70"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
