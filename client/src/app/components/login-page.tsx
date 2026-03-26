import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { motion } from "motion/react";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AuthLayout } from "./auth-layout";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setServerError(err.message || "Email ou senha incorretos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.1 + i * 0.08, duration: 0.4, ease: "easeOut" as const },
    }),
  };

  return (
    <AuthLayout title="Acesse sua conta" subtitle="Insira seus dados para continuar">
      {serverError && (
        <motion.div
          className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" /> {serverError}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="seu@email.com"
              className="pl-10 h-11 bg-secondary/50 border-border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        </motion.div>

        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10 h-11 bg-secondary/50 border-border"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="mt-2 text-right">
            <Link
              to="/reset-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>
        </motion.div>

        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="pt-1">
          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              "Entrar"
            )}
          </Button>
        </motion.div>
      </form>

      {/* Divider */}
      <motion.div
        className="flex items-center gap-4 my-7"
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Ou continue com
        </span>
        <div className="flex-1 h-px bg-border" />
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-3"
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            label: "Google",
            href: "http://localhost:3000/auth/google",
            icon: (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 5.48c1.68 0 3.19.55 4.38 1.62l3.27-3.27A11.97 11.97 0 0 0 12 .5 12 12 0 0 0 1.24 6.65l4.03 3.11Z" />
                <path fill="#34A853" d="M16.04 18.01A7.4 7.4 0 0 1 12 19.02a7.08 7.08 0 0 1-6.73-4.76l-4.03 3.11A12 12 0 0 0 12 23.5c3.08 0 5.97-1.15 8.13-3.31l-4.09-2.18Z" />
                <path fill="#4A90D9" d="M20.13 20.19A11.8 11.8 0 0 0 23.5 12c0-.82-.1-1.67-.28-2.5H12v5h6.47a5.9 5.9 0 0 1-2.43 3.51l4.09 2.18Z" />
                <path fill="#FBBC05" d="M5.27 14.26A7.2 7.2 0 0 1 4.92 12c0-.79.13-1.55.35-2.26L1.24 6.65A12 12 0 0 0 0 12c0 1.94.45 3.78 1.24 5.35l4.03-3.09Z" />
              </svg>
            ),
          },

          {
            label: "GitHub",
            href: "http://localhost:3000/auth/github",
            icon: (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .3Z" />
              </svg>
            ),
          },
        ].map((p) => (
          <a
            key={p.label}
            href={p.href}
            className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 text-[11px] sm:text-xs rounded-xl border border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-secondary/60 transition-all duration-200 min-w-0"
            style={{ fontWeight: 500 }}
          >
            <span className="shrink-0">{p.icon}</span>
            <span className="truncate">{p.label}</span>
          </a>
        ))}
      </motion.div>

      {/* Register link */}
      <motion.p
        className="mt-8 text-center text-sm text-muted-foreground"
        custom={5}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        Não tem uma conta?{" "}
        <Link
          to="/register"
          className="text-primary hover:text-primary/80 transition-colors"
          style={{ fontWeight: 600 }}
        >
          Criar conta
        </Link>
      </motion.p>
    </AuthLayout>
  );
}