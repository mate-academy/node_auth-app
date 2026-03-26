import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Loader2, Shield } from "lucide-react";

export function ActivationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { activate } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    
    activate(token)
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/"), 2000);
      })
      .catch(() => {
        setStatus("error");
      });
  }, [activate, navigate, token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#22d3ee]/8 rounded-full blur-[120px]" />
      </div>

      <motion.div
        className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-10 w-full max-w-md text-center shadow-2xl shadow-black/20 relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-foreground" style={{ fontWeight: 700 }}>Ativando sua conta...</h1>
            <p className="text-sm text-muted-foreground mt-2">Aguarde um momento</p>
          </>
        )}
        {status === "success" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-16 h-16 rounded-2xl bg-[#10b981]/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
            </div>
            <h1 className="text-[#10b981]" style={{ fontWeight: 700 }}>Conta ativada!</h1>
            <p className="text-sm text-muted-foreground mt-2">Redirecionando para o painel...</p>
          </motion.div>
        )}
        {status === "error" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-16 h-16 rounded-2xl bg-destructive/15 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-destructive" style={{ fontWeight: 700 }}>Erro na ativação</h1>
            <p className="text-sm text-muted-foreground mt-2">Token inválido ou expirado</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
