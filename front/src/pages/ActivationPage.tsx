import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";

export default function ActivationPage() {
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status");
  const submitted = status === "success";

  return (
    <AuthLayout
      title="Account Activation"
      description=""
    >
      {submitted ? (
        <div className="space-y-4">
          <p className="text-center text-sm leading-relaxed text-black/60">
            Congratulations! Your account has been successfully
            activated. You can now go to your profile.
          </p>

          <Link
            to="/profile"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-black/85"
          >
            Go to Your Profile
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-center text-sm leading-relaxed text-black/60">
            Something went wrong. The activation link may be
            invalid or has already been used.
          </p>

          <p className="text-center text-sm text-black/60">
            Please try signing up again if you still need to
            activate your account.
          </p>

          <Link
            to="/register"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-black/85"
          >
            Back to Sign Up
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
