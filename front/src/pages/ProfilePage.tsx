import { useState, type FormEvent, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch, SessionExpiredError } from "@/api";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/PasswordInput";
import { useAuth } from "@/AuthContext";

type ChangePassword = {
  currentPassword: string;
  password: string;
  confirmation: string;
};

type ChangeEmail = {
  currentPassword: string;
  newEmail: string;
  confirmEmail: string;
};

const EMPTY_PASSWORD_FORM: ChangePassword = {
  currentPassword: "",
  password: "",
  confirmation: "",
};

const EMPTY_EMAIL_FORM: ChangeEmail = {
  currentPassword: "",
  newEmail: "",
  confirmEmail: "",
};

export default function ProfilePage() {
  const [changePassword, setChangePassword] =
    useState<ChangePassword>(EMPTY_PASSWORD_FORM);
  const [changeEmail, setChangeEmail] =
    useState<ChangeEmail>(EMPTY_EMAIL_FORM);
  const [passError, setPassError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [statusPassword, setStatusPassword] = useState("");
  const [statusEmail, setStatusEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const emailChange = searchParams.get("emailChange");
  const { user, setUser } = useAuth();

  function handleFormPass(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setChangePassword((prev) => ({ ...prev, [name]: value }));
    setPassError("");
  }

  function handleFormEmail(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setChangeEmail((prev) => ({ ...prev, [name]: value }));
    setEmailError("");
  }

  const handleUpdatePass = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPassError("");
    setStatusPassword("");

    try {
      const response = await apiFetch("/auth/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changePassword),
      });

      const data = await response.json();

      if (!response.ok) {
        return setPassError(data.message);
      }

      setStatusPassword(data.message);
      setChangePassword(EMPTY_PASSWORD_FORM);
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        setUser(null);

        return;
      }

      console.error(error);
    }
  };

  const handleUpdateEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError("");
    setStatusEmail("");

    try {
      const response = await apiFetch("/auth/profile/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changeEmail),
      });

      const data = await response.json();

      if (!response.ok) {
        return setEmailError(data.message);
      }

      setStatusEmail(data.message);
      setChangeEmail(EMPTY_EMAIL_FORM);
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        setUser(null);

        return;
      }

      console.error(error);
    }
  };

  const handleLogout = async () => {
    setLogoutError("");

    try {
      const response = await apiFetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        setLogoutError("Server did not confirm logout");
      }
    } catch (error) {
      if (!(error instanceof SessionExpiredError)) {
        console.error(error);
      }
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <AuthLayout
      title="Profile Settings"
      description="Manage your personal information and account security."
    >
      <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:py-14">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <section className="space-y-5 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold">Personal Information</h2>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <p className="text-sm font-medium">
                {user.name || "Not provided"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Current Email Address</Label>
              <p className="text-sm font-medium">
                {user.email || "Not provided"}
              </p>
            </div>
          </section>

          <section className="space-y-5 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <p className="text-sm text-muted-foreground">
                Choose a strong password to keep your account secure.
              </p>
              {passError && <p className="text-sm text-red-600">{passError}</p>}
              {statusPassword && (
                <p className="text-sm text-green-700">{statusPassword}</p>
              )}
            </div>

            <form className="space-y-4" onSubmit={handleUpdatePass}>
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  name="currentPassword"
                  value={changePassword.currentPassword}
                  onChange={handleFormPass}
                  type="password"
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <PasswordInput
                  id="password"
                  name="password"
                  value={changePassword.password}
                  onChange={handleFormPass}
                  placeholder="Enter a new password"
                  autoComplete="new-password"
                  showPassword={showPassword}
                  onShowPasswordChange={() => setShowPassword((prev) => !prev)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmation">Confirm New Password</Label>
                <PasswordInput
                  id="confirmation"
                  name="confirmation"
                  value={changePassword.confirmation}
                  onChange={handleFormPass}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  showPassword={showPassword}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-black text-white hover:bg-black/85"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </section>

          <section className="space-y-5 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Change Email Address</h2>
              <p className="text-sm text-muted-foreground">
                Update the email address associated with your account.
              </p>
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
              {statusEmail && (
                <p className="text-sm text-green-700">{statusEmail}</p>
              )}
              {emailChange === "success" && (
                <p className="text-sm text-green-700">
                  Email changed successfully.
                </p>
              )}
              {emailChange === "invalid" && (
                <p className="text-sm text-red-600">
                  The link is invalid or expired.
                </p>
              )}
              {emailChange === "taken" && (
                <p className="text-sm text-red-600">
                  This email is already in use.
                </p>
              )}
            </div>

            <form className="space-y-4" onSubmit={handleUpdateEmail}>
              <div className="space-y-2">
                <Label htmlFor="email-password">Current Password</Label>
                <Input
                  id="email-password"
                  name="currentPassword"
                  value={changeEmail.currentPassword}
                  onChange={handleFormEmail}
                  type="password"
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email">New Email Address</Label>
                <Input
                  id="new-email"
                  name="newEmail"
                  value={changeEmail.newEmail}
                  onChange={handleFormEmail}
                  type="email"
                  placeholder="Enter your new email address"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-email">Confirm New Email Address</Label>
                <Input
                  id="confirm-email"
                  name="confirmEmail"
                  value={changeEmail.confirmEmail}
                  onChange={handleFormEmail}
                  type="email"
                  placeholder="Confirm your new email address"
                  autoComplete="email"
                />
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  A confirmation link will be sent to your new email address. We
                  will also notify your current email address about this change.
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-black text-white hover:bg-black/85"
                >
                  Update Email Address
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-xl border border-destructive/30 bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Log Out</h2>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account on this device.
                </p>
                {logoutError && (
                  <p className="text-sm text-red-600">{logoutError}</p>
                )}
              </div>

              <Button
                variant="destructive"
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </div>
          </section>
        </div>
      </main>
    </AuthLayout>
  );
}
