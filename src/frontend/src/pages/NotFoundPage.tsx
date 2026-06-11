import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="text-center flex flex-col gap-4">
        <h1 className="text-8xl font-bold text-purple-500">404</h1>
        <p className="text-zinc-400 text-lg">Page not found</p>
        <Link to="/login" className="text-purple-400 hover:underline text-sm">Go to Login</Link>
      </div>
    </div>
  );
}
