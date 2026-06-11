import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.ts";
import { useState } from "react";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/profile");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-800 border border-zinc-700 p-8 rounded-xl shadow-xl w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-white">Login</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-zinc-700 border border-zinc-600 text-white placeholder-zinc-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Login
        </button>
        <div className="flex justify-between text-sm">
          <Link to="/register" className="text-purple-400 hover:underline">Don't have an account?</Link>
          <Link to="/password-reset" className="text-purple-400 hover:underline">Forgot password?</Link>
        </div>
      </form>
    </div>
  );
}
