
import { useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const BASE_URL = "http://localhost:3000";

  const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      const reponse = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      });

      const data = await reponse.json();

      if (!reponse.ok) {
        return setError(data.message);
      }

      setMessage(data.message);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="We'll send you a link to reset your password"
    >
      {submitted ? (
        <div className="space-y-5">
          <p className="text-center text-sm leading-relaxed text-black/60">
            {message}
          </p>

          <Link
            to="/login"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-black/85"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              autoComplete="email"
              value={email}
              onChange={handleEmail}
              required
              className="h-12 rounded-xl border-black/10 bg-white/70"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-black text-white hover:bg-black/85"
          >
            Send reset link
          </Button>

          <p className="text-center text-sm text-black/60">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-black underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
