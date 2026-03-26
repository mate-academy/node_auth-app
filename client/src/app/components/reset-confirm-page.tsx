import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { motion } from "motion/react";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AuthLayout } from "./auth-layout";

const passwordRules = [
  { label: "8+ caracteres", test: (p: string) => p.length >= 8 },
  { label: "1 maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "1 minúscula", test: (p: string) => /[a-z]/.test(p) },
  { label: "1 número", test: (p: string) => /\d/.test(p) },
];

export function ResetConfirmPage() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmation) { setServerError("As senhas não coincidem"); return; }
    setServerError("");
    setIsSubmitting(true);
    try {
      await authApi.confirmReset(token, password, confirmation);
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || "Link inválido ou expirado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.08, duration: 0.4, ease: "easeOut" as const } }),
  };

  return (
    <AuthLayout title="Nova Senha">
      {success ? (
        <motion.div className="text-center py-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-16 h-16 rounded-2xl bg-[#10b981]/15 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
          </div>
          <h2 className="text-[#10b981] mb-2" style={{ fontWeight: 600 }}>Senha redefinida!</h2>
          <p className="text-sm text-muted-foreground mb-8">Sua senha foi alterada com sucesso.</p>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-10">Ir para Login</Button>
          </Link>
        </motion.div>
      ) : (
        <>
          {serverError && (
            <motion.div className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AlertCircle className="w-4 h-4 shrink-0" /> {serverError}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Nova senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" className="pl-10 h-11 bg-secondary/50 border-border" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {passwordRules.map((rule) => (
                  <div key={rule.label} className="flex items-center gap-2 text-xs">
                    <span className={`transition-colors duration-300 ${rule.test(password) ? "text-[#10b981]" : "text-muted-foreground/50"}`}>{rule.test(password) ? "✓" : "○"}</span>
                    <span className={`transition-colors duration-300 ${rule.test(password) ? "text-[#10b981]" : "text-muted-foreground"}`}>{rule.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" className="pl-10 h-11 bg-secondary/50 border-border" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
              </div>
            </motion.div>
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="pt-1">
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : "Redefinir Senha"}
              </Button>
            </motion.div>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
