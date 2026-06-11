import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { authApi } from "../api/auth";

export function PasswordResetConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate("/login"), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirm) return setError("Passwords do not match");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters");

    try {
      await authApi.confirmPasswordReset(token, newPassword);
      setSuccess(true);
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error ?? "Something went wrong" : "Something went wrong";
      setError(message);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="bg-zinc-800 border border-zinc-700 p-8 rounded-xl shadow-xl w-full max-w-md text-center flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-red-400">Invalid link</h1>
          <Link to="/password-reset" className="text-purple-400 hover:underline text-sm">Request new reset link</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="bg-zinc-800 border border-zinc-700 p-8 rounded-xl shadow-xl w-full max-w-md text-center flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-green-400">Password changed!</h1>
          <p className="text-zinc-300">Your password was successfully reset.</p>
          <p className="text-zinc-500 text-sm">Redirecting to login...</p>
          <Link to="/login" className="text-purple-400 hover:underline text-sm">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-800 border border-zinc-700 p-8 rounded-xl shadow-xl w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-white">Set New Password</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
