import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Home, SearchX } from "lucide-react";
import { Button } from "./ui/button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-destructive/8 rounded-full blur-[120px]" />
      </div>

      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-[120px] leading-none bg-linear-to-br from-primary to-[#22d3ee] bg-clip-text text-transparent mb-4"
          style={{ fontWeight: 800 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          404
        </motion.div>
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-foreground mb-2" style={{ fontWeight: 700 }}>Página não encontrada</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          A página que você procura não existe ou foi removida.
        </p>
        <Link to="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 px-8 h-11">
            <Home className="w-4 h-4" /> Voltar ao início
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
