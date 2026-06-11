import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { authApi } from "../api/auth";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (p: string) => {
    if (p.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(p)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(p)) return "Password must contain at least one number";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const passwordError = validatePassword(password);
    if (passwordError) return setError(passwordError);

    try {
      await authApi.register({ email, password, name });
      setSuccess(true);
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.error ?? "Something went wrong" : "Something went wrong");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="bg-zinc-800 border border-zinc-700 p-8 rounded-xl shadow-xl w-full max-w-md text-center flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="text-zinc-300">We sent an activation link to <strong className="text-white">{email}</strong></p>
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
        <h1 className="text-2xl font-bold text-white">Register</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-zinc-400">
          Password rules: min 8 characters, 1 uppercase letter, 1 number
        </p>
        <button
          type="submit"
          className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Register
        </button>
        <Link to="/login" className="text-purple-400 hover:underline text-sm text-center">Already have an account?</Link>
      </form>
    </div>
  );
}
