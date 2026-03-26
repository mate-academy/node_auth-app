import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { expenseApi, ExpenseResponse } from "../../api/expenseApi";
import { categoryApi, CategoryResponse } from "../../api/categoryApi";
import { motion } from "motion/react";
import {
  TrendingUp,
  BarChart3,
  Tags,
  ArrowUpRight,
  Receipt,
  Calendar,
  Pencil,
  Trash2,
  FileText,
  Tag,
  Banknote,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";

type Expense = ExpenseResponse;

export function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.name?.split(" ")[0] || "Usuário";
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", amount: "", category: "", spentAt: "", note: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editError, setEditError] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [expensesData, categoriesData] = await Promise.all([
        expenseApi.getAll(),
        categoryApi.getAll()
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoriesCount = [...new Set(expenses.map((e) => e.category))].length;
  const recentExpenses = [...expenses].sort((a, b) => b.spentAt.localeCompare(a.spentAt)).slice(0, 5);

  const stats = [
    {
      label: "Total de Despesas",
      value: expenses.length.toString(),
      icon: BarChart3,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      label: "Valor Total",
      value: `R$ ${(totalAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Banknote,
      gradient: "from-[#22d3ee]/20 to-[#22d3ee]/5",
      iconColor: "text-[#22d3ee]",
    },
    {
      label: "Categorias",
      value: categoriesCount.toString(),
      icon: Tags,
      gradient: "from-[#a78bfa]/20 to-[#a78bfa]/5",
      iconColor: "text-[#a78bfa]",
    },
  ];

  const categoryColors: Record<string, string> = {
    "Alimentação": "bg-[#f59e0b]/15 text-[#f59e0b]",
    "Transporte": "bg-[#22d3ee]/15 text-[#22d3ee]",
    "Entretenimento": "bg-[#a78bfa]/15 text-[#a78bfa]",
    "Saúde": "bg-[#10b981]/15 text-[#10b981]",
    "Moradia": "bg-primary/15 text-primary",
  };

  const formatCurrency = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    const cents = parseInt(digits || "0", 10);
    return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const openExpenseModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditing(false);
    setEditError("");
  };

  const startEditing = () => {
    if (!selectedExpense) return;
    setEditForm({
      title: selectedExpense.title,
      amount: String(selectedExpense.amount),
      category: selectedExpense.category,
      spentAt: selectedExpense.spentAt,
      note: selectedExpense.note,
    });
    setIsEditing(true);
    setEditError("");
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditError("");
  };

  const saveEdit = async () => {
    if (!editForm.title || !editForm.amount) {
      setEditError("Preencha os campos obrigatórios");
      return;
    }
    if (!selectedExpense) return;
    try {
      setEditError("");
      const updatedData = {
        title: editForm.title,
        amount: Number(editForm.amount),
        category: editForm.category,
        spentAt: editForm.spentAt,
        note: editForm.note,
      };
      
      const updated = await expenseApi.update(selectedExpense.id, updatedData);
      
      setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setSelectedExpense(updated);
      setIsEditing(false);
    } catch (err: any) {
      setEditError(err.message || "Erro ao salvar despesa");
    }
  };

  const confirmDelete = async () => {
    if (!selectedExpense) return;
    try {
      await expenseApi.remove(selectedExpense.id);
      setExpenses((prev) => prev.filter((e) => e.id !== selectedExpense.id));
      setShowDeleteConfirm(false);
      setSelectedExpense(null);
    } catch (err) {
      console.error("Erro ao deletar", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-foreground mb-1" style={{ fontWeight: 700 }}>
          Olá, <span className="bg-linear-to-r from-primary to-[#34d399] bg-clip-text text-transparent">{userName}</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Aqui está o resumo das suas finanças. Acompanhe seus gastos e mantenha o controle.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="last:col-span-1 min-[400px]:last:col-span-2 sm:last:col-span-1"
          >
            <Card className="border-border bg-card/80 hover:bg-card transition-colors h-full">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider" style={{ fontWeight: 500 }}>
                    {stat.label}
                  </span>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-linear-to-br ${stat.gradient} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl text-foreground truncate" style={{ fontWeight: 700 }}>
                  {stat.value}
                </div>
                <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-[#10b981]">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12% este mês</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card className="border-border bg-card/80 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              
              <h2 className="text-sm text-foreground" style={{ fontWeight: 600 }}>Despesas Recentes</h2>
            </div>
            <Link
              to="/expenses"
              className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              style={{ fontWeight: 500 }}
            >
              Ver todas
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3 flex items-center justify-center" style={{ fontWeight: 700, fontSize: "1.25rem" }}>R$</div>
              <p className="text-sm text-muted-foreground">
                Nenhuma despesa encontrada.{" "}
                <Link to="/expenses" className="text-primary hover:text-primary/80">Criar uma?</Link>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-secondary/30 transition-colors gap-3 cursor-pointer"
                  onClick={() => openExpenseModal(expense)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs text-primary" style={{ fontWeight: 700 }}>R$</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-foreground truncate" style={{ fontWeight: 500 }}>
                        {expense.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] ${categoryColors[expense.category] || "bg-secondary text-muted-foreground"}`} style={{ fontWeight: 500 }}>
                          {expense.category}
                        </span>
                        <span className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {expense.spentAt.split("-").reverse().join("/")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-foreground shrink-0" style={{ fontWeight: 600 }}>
                    R$ {(expense.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Expense Detail/Edit Modal */}
      <Dialog open={!!selectedExpense && !showDeleteConfirm} onOpenChange={(open) => { if (!open) { setSelectedExpense(null); setIsEditing(false); setEditError(""); } }}>
        <DialogContent className="bg-popover border-border sm:max-w-md">
          {selectedExpense && !isEditing && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-primary" style={{ fontWeight: 700 }}>R$</span>
                  </div>
                  {selectedExpense.title}
                </DialogTitle>
                <DialogDescription className="sr-only">Detalhes da despesa</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontWeight: 500 }}>Valor</span>
                  <span className="text-lg text-foreground" style={{ fontWeight: 700 }}>
                    R$ {(selectedExpense.amount / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="py-3 px-4 rounded-xl bg-secondary/30 border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1" style={{ fontWeight: 500 }}>Categoria</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] ${categoryColors[selectedExpense.category] || "bg-secondary text-muted-foreground"}`} style={{ fontWeight: 500 }}>
                      {selectedExpense.category || "Sem categoria"}
                    </span>
                  </div>
                  <div className="py-3 px-4 rounded-xl bg-secondary/30 border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1" style={{ fontWeight: 500 }}>Data</span>
                    <span className="text-sm text-foreground flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      {selectedExpense.spentAt.split("-").reverse().join("/")}
                    </span>
                  </div>
                </div>
                {selectedExpense.note && (
                  <div className="py-3 px-4 rounded-xl bg-secondary/30 border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1" style={{ fontWeight: 500 }}>Nota</span>
                    <span className="text-sm text-foreground" style={{ fontWeight: 400 }}>{selectedExpense.note}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button onClick={startEditing} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2">
                    <Pencil className="w-4 h-4" /> Editar
                  </Button>
                  <Button onClick={() => setShowDeleteConfirm(true)} variant="outline" className="flex-1 rounded-xl gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="w-4 h-4" /> Excluir
                  </Button>
                </div>
              </div>
            </>
          )}

          {selectedExpense && isEditing && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">Editar Despesa</DialogTitle>
                <DialogDescription className="sr-only">Edite os campos da despesa</DialogDescription>
              </DialogHeader>
              {editError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{editError}</div>
              )}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Título</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 h-10 bg-secondary/50 border-border" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Valor</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" style={{ fontWeight: 600 }}>R$</span>
                    <Input type="text" inputMode="numeric" className="pl-10 h-10 bg-secondary/50 border-border" value={editForm.amount ? formatCurrency(editForm.amount) : ""} onChange={(e) => { const digits = e.target.value.replace(/\D/g, ""); setEditForm({ ...editForm, amount: digits }); }} placeholder="0,00" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="date" className="pl-10 h-10 bg-secondary/50 border-border [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" value={editForm.spentAt} onChange={(e) => setEditForm({ ...editForm, spentAt: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Categoria</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <select
                      className="w-full pl-10 h-10 bg-secondary/50 border border-border rounded-md text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring [&>option]:bg-popover [&>option]:text-foreground"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      <option value="">Selecione</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Nota</label>
                  <Input className="h-10 bg-secondary/50 border-border" value={editForm.note} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={saveEdit} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                    Salvar
                  </Button>
                  <Button onClick={cancelEditing} variant="outline" className="flex-1 rounded-xl">
                    Cancelar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-popover border-border sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a despesa <span className="text-foreground" style={{ fontWeight: 600 }}>"{selectedExpense?.title}"</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}