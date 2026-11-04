import { Input } from "@/components/ui/input";
import { useState, type ComponentProps } from "react";

interface PasswordInputProps extends ComponentProps<typeof Input> {
  showPassword?: boolean;
  onShowPasswordChange?: () => void;
}

export default function PasswordInput({
  className,
  showPassword: externalShowPassword,
  onShowPasswordChange,
  ...props
}: PasswordInputProps) {
  const [internalShowPassword, setInternalShowPassword] = useState(false);

  const isControlled = externalShowPassword !== undefined;
  const isVisible = isControlled ? externalShowPassword : internalShowPassword;
  const hasEyeButton = !isControlled || onShowPasswordChange !== undefined;

  const handleToggle = () => {
    if (onShowPasswordChange) {
      onShowPasswordChange();
    } else {
      setInternalShowPassword((prev) => !prev);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        type={isVisible ? "text" : "password"}
        autoComplete="current-password"
        {...props}
        className={`h-12 rounded-xl border-black/10 bg-white/70 px-4 text-black placeholder:text-black/40 focus-visible:ring-black/20 ${
          hasEyeButton ? "pr-12" : ""
        } ${className || ""}`}
      />

      {hasEyeButton && (
        <button
          type="button"
          aria-label={isVisible ? "Hide password" : "Show password"}
          onClick={handleToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black focus:outline-none"
        >
          {isVisible ? (
            <svg className="h-5 w-5" viewBox="0 -960 960 960" fill="currentColor">
              <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.500 52.500T660-500q0 20-4 37.500T644-428Zm128 126-58-56q38-29 67.500-63.500T832-500q-50-101-143.500-160.500T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.500t90-8.500q151 0 269 83.500T920-500q-23 59-60.500 109.500T772-302Zm20 246L624-222q-35 11-70.500 16.500T480-200q-151 0-269-83.500T40-500q21-53 53-98.500t73-81.500L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.500 160.500T480-280q20 0 39-2.500t39-5.500l-36-38q-11 3-21 4.500t-21 1.500q-75 0-127.500-52.500T300-500q0-11 1.500-21t4.500-21l-84-82Zm319 93Zm-151 75Z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M480-320q75 0 127.500-52.500T660-500q0-75-52.500-127.500T480-680q-75 0-127.500 52.500T300-500q0 75 52.500 127.500T480-320Zm0-72q-45 0-76.500-31.500T372-500q0-45 31.500-76.500T480-608q45 0 76.500 31.500T588-500q0 45-31.500 76.500T480-392Zm0 192q-146 0-266-81.500T40-500q54-137 174-218.500T480-800q146 0 266 81.500T920-500q-54 137-174 218.500T480-200Zm0-300Zm0 220q113 0 207.500-59.500T832-500q-50-101-144.500-160.500T480-720q-113 0-207.500 59.500T128-500q50 101 144.500 160.500T480-280Z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
