import { motion } from "motion/react";
import { type ReactNode } from "react";
import { Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export function AuthLayout({
  children,
  icon,
  title,
  subtitle,
}: {
  children: ReactNode;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#22d3ee]/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-110 relative z-10">
        {/* Branding */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl text-foreground" style={{ fontWeight: 700 }}>
              Finance<span className="text-primary">App</span>
            </span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/20"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            {icon && <div className="mb-3">{icon}</div>}
            <h1 className="text-foreground mb-2 tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}