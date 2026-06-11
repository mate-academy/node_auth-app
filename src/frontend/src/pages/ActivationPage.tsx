import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { authApi } from "../api/auth";

export function ActivationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "Invalid activation link"
  );

  useEffect(() => {
    if (!token) return;

    authApi.activate(token)
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/profile"), 3000);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(axios.isAxiosError(err) ? err.response?.data?.error ?? "Activation failed" : "Activation failed");
      });
  }, [token, navigate]);

  if (status === "loading") return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <p className="text-zinc-400 text-lg">Activating your account...</p>
    </div>
  );

  if (status === "success") {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="bg-zinc-800 border border-zinc-700 p-8 rounded-xl shadow-xl w-full max-w-md text-center flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-green-400">Account activated!</h1>
          <p className="text-zinc-300">Redirecting to profile...</p>
          <Link to="/profile" className="text-purple-400 hover:underline text-sm">Go to Profile</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="bg-zinc-800 border border-zinc-700 p-8 rounded-xl shadow-xl w-full max-w-md text-center flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-400">Activation failed</h1>
        <p className="text-red-400 text-sm">{errorMessage}</p>
        <Link to="/login" className="text-purple-400 hover:underline text-sm">Back to Login</Link>
      </div>
    </div>
  );
}
