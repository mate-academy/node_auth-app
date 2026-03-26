import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { motion } from "motion/react";
import { Mail, Lock, User, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AuthLayout } from "./auth-layout";

const passwordRules = [
  { label: "8+ caracteres", test: (p: string) => p.length >= 8 },
  { label: "1 maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "1 minúscula", test: (p: string) => /[a-z]/.test(p) },
  { label: "1 número", test: (p: string) => /\d/.test(p) },
];

export function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      setMessage("Conta criada! Verifique seu email para ativar.");
    } catch (err: any) {
      setServerError(err.message || "Erro ao criar conta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: 0.1 + i * 0.08, duration: 0.4, ease: "easeOut" as const },
    }),
  };

  return (
    <AuthLayout title="Criar Conta" subtitle="Preencha seus dados para começar">
      {message && (
        <motion.div
          className="mb-6 p-3.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-sm flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
        </motion.div>
      )}
      {serverError && (
        <motion.div
          className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" /> {serverError}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Nome</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="text" placeholder="Seu nome" className="pl-10 h-11 bg-secondary/50 border-border" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </motion.div>

        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="email" placeholder="seu@email.com" className="pl-10 h-11 bg-secondary/50 border-border" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </motion.div>

        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 h-11 bg-secondary/50 border-border" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {passwordRules.map((rule) => (
              <div key={rule.label} className="flex items-center gap-2 text-xs">
                <span className={`transition-colors duration-300 ${rule.test(password) ? "text-[#10b981]" : "text-muted-foreground/50"}`}>
                  {rule.test(password) ? "✓" : "○"}
                </span>
                <span className={`transition-colors duration-300 ${rule.test(password) ? "text-[#10b981]" : "text-muted-foreground"}`}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="pt-1">
          <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : "Criar Conta"}
          </Button>
        </motion.div>
      </form>

      <motion.p className="mt-8 text-center text-sm text-muted-foreground" custom={4} variants={fadeUp} initial="hidden" animate="visible">
        Já tem uma conta?{" "}
        <Link to="/login" className="text-primary hover:text-primary/80 transition-colors" style={{ fontWeight: 600 }}>Entrar</Link>
      </motion.p>
    </AuthLayout>
  );
}
