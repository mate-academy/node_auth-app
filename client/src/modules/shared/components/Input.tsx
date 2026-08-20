import { forwardRef, type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, type = 'text', className, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <input
          ref={ref}
          placeholder="john@example.com"
          type={type}
          {...rest}
          className={`w-full rounded-xl bg-slate-900 border ${
            error
              ? 'border-rose-500/80 focus:border-rose-500'
              : 'border-slate-800 focus:border-indigo-500'
          } px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${className}`}
        />
        {error && <span className="text-xs text-rose-500">{error}</span>}
      </div>
    );
  },
);
