import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { authApi } from "../api/auth";

export function PasswordResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.error ?? "Something went wrong" : "Something went wrong");
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="bg-zinc-800 border border-zinc-700 p-8 rounded-xl shadow-xl w-full max-w-md text-center flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="text-zinc-300">If <strong className="text-white">{email}</strong> exists, you will receive a reset link.</p>
          <Link to="/login" className="text-purple-400 hover:underline text-sm">Back to Login</Link>
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
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        <p className="text-zinc-400 text-sm">Enter your email and we'll send you a reset link.</p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Send Reset Link
        </button>
        <Link to="/login" className="text-purple-400 hover:underline text-sm text-center">Back to Login</Link>
      </form>
    </div>
  );
}
