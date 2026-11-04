import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/PasswordInput";

type Form = {
  password: string;
  confirmation: string;
};

export default function ResetPage() {
  const [form, setForm] = useState<Form>({
    password: "",
    confirmation: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { resetToken } = useParams();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
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

    try {
      const BASE_URL = "http://localhost:3000";

      const response = await fetch(`${BASE_URL}/auth/reset`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: form.password,
          confirmation: form.confirmation,
          token: resetToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      navigate("/login");
    } catch (error) {
      console.error(error);
      setError("Reset failed");
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter new password and conformation and press button reset"
    >
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form className="space-y-6" onSubmit={handleForm}>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-black/80">
            Password
          </Label>

          <PasswordInput
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            showPassword={showPassword}
            onShowPasswordChange={() => setShowPassword((prev) => !prev)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmation" className="text-sm text-black/80">
            Confirm the password
          </Label>

          <PasswordInput
            id="confirmation"
            name="confirmation"
            value={form.confirmation}
            onChange={handleChange}
            placeholder="Confirm the password"
            required
            showPassword={showPassword}
          />
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-black text-white hover:bg-black/85"
        >
          Reset
        </Button>
      </form>
    </AuthLayout>
  );
}
