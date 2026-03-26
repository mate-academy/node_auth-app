import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { motion } from "motion/react";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AuthLayout } from "./auth-layout";

export function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.requestReset(email);
      setSent(true);
    } catch (err) {
      // Show success even on error to prevent email enumeration
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.08, duration: 0.4, ease: "easeOut" as const } }),
  };

  return (
    <AuthLayout title="Recuperar Senha">
      {sent ? (
        <motion.div className="text-center py-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
            <Send className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-foreground mb-2" style={{ fontWeight: 600 }}>Email enviado!</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Se o email estiver cadastrado, você receberá um link de recuperação.
          </p>
          <Link to="/login" className="text-primary hover:text-primary/80 text-sm transition-colors inline-flex items-center gap-1" style={{ fontWeight: 600 }}>
            <ArrowLeft className="w-4 h-4" /> Voltar ao login
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.p className="text-sm text-muted-foreground text-center mb-6" custom={0} variants={fadeUp} initial="hidden" animate="visible">
            Insira seu email para receber o link de recuperação
          </motion.p>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="seu@email.com" className="pl-10 h-11 bg-secondary/50 border-border" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </motion.div>
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="pt-1">
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : "Enviar Link"}
              </Button>
            </motion.div>
          </form>
          <motion.p className="mt-8 text-center text-sm" custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1" style={{ fontWeight: 600 }}>
              <ArrowLeft className="w-4 h-4" /> Voltar ao login
            </Link>
          </motion.p>
        </>
      )}
    </AuthLayout>
  );
}
