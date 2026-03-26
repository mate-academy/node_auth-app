import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { useAuth } from "../../context/useAuth";
import { authApi } from "../../api/authApi";

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [nameForm, setNameForm] = useState({ name: user?.name || "" });

  useEffect(() => {
    if (user) setNameForm({ name: user.name });
  }, [user]);

  const [passForm, setPassForm] = useState({ oldPassword: "", newPassword: "", confirmation: "" });
  const [emailForm, setEmailForm] = useState({ password: "", newEmail: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearFeedback = () => { setMessage(""); setError(""); };

  const handleName = async (e: React.FormEvent) => {
    e.preventDefault(); clearFeedback(); setLoading(true);
    try {
      await authApi.changeName(nameForm.name);
      await refreshUser();
      setMessage("Nome atualizado com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar nome.");
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault(); clearFeedback(); setLoading(true);
    if (passForm.newPassword !== passForm.confirmation) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }
    try {
      await authApi.changePassword(passForm.oldPassword, passForm.newPassword, passForm.confirmation);
      setMessage("Senha alterada com sucesso!");
      setPassForm({ oldPassword: "", newPassword: "", confirmation: "" });
    } catch (err: any) {
      setError(err.message || "Erro ao alterar senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault(); clearFeedback(); setLoading(true);
    try {
      await authApi.changeEmail(emailForm.password, emailForm.newEmail);
      await refreshUser();
      setMessage("Email alterado! Notificação enviada ao email.");
      setEmailForm({ password: "", newEmail: "" });
    } catch (err: any) {
      setError(err.message || "Erro ao alterar email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-foreground" style={{ fontWeight: 700 }}>Meu Perfil</h1>
      </motion.div>

      {/* User Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border bg-card/80">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/30 to-[#22d3ee]/20 flex items-center justify-center text-2xl text-primary" style={{ fontWeight: 700 }}>
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="text-foreground" style={{ fontWeight: 600 }}>{user?.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" /> {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback */}
      {message && (
        <motion.div className="p-3.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-sm flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
        </motion.div>
      )}
      {error && (
        <motion.div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Tabs defaultValue="info">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="info" className="gap-1.5"><User className="w-3.5 h-3.5" /> Nome</TabsTrigger>
            <TabsTrigger value="password" className="gap-1.5"><Lock className="w-3.5 h-3.5" /> Senha</TabsTrigger>
            <TabsTrigger value="email" className="gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</TabsTrigger>
          </TabsList>

          <Card className="border-border bg-card/80 mt-4">
            <CardContent className="p-6">
              <TabsContent value="info">
                <form onSubmit={handleName} className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Nome</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input className="pl-10 h-10 bg-secondary/50 border-border" value={nameForm.name} onChange={(e) => setNameForm({ name: e.target.value })} required />
                    </div>
                  </div>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar nome"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="password">
                <form onSubmit={handlePassword} className="space-y-4 max-w-sm">
                  {[
                    { label: "Senha atual", key: "oldPassword" as const },
                    { label: "Nova senha", key: "newPassword" as const },
                    { label: "Confirmar senha", key: "confirmation" as const },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>{field.label}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" className="pl-10 h-10 bg-secondary/50 border-border" value={passForm[field.key]} onChange={(e) => setPassForm({ ...passForm, [field.key]: e.target.value })} required />
                      </div>
                    </div>
                  ))}
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" disabled={loading}>
                    {loading ? "Alterando..." : "Alterar senha"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="email">
                <form onSubmit={handleEmail} className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Sua senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10 h-10 bg-secondary/50 border-border" value={emailForm.password} onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Novo email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="email" placeholder="novo@email.com" className="pl-10 h-10 bg-secondary/50 border-border" value={emailForm.newEmail} onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })} required />
                    </div>
                  </div>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" disabled={loading}>
                    {loading ? "Alterando..." : "Alterar email"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </motion.div>
    </div>
  );
}
