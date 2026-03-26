import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { expenseApi, ExpenseResponse } from "../../api/expenseApi";
import { categoryApi, CategoryResponse } from "../../api/categoryApi";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Calendar,
  FileText,
  Tag,
  Receipt,
  Search,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

type Expense = ExpenseResponse;

const categoryColors: Record<string, string> = {
  "Alimentação": "bg-[#f59e0b]/15 text-[#f59e0b]",
  "Transporte": "bg-[#22d3ee]/15 text-[#22d3ee]",
  "Entretenimento": "bg-[#a78bfa]/15 text-[#a78bfa]",
  "Saúde": "bg-[#10b981]/15 text-[#10b981]",
  "Moradia": "bg-primary/15 text-primary",
};

export function ExpensesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ spentAt: "", title: "", amount: "", category: "", note: "" });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalEditing, setIsModalEditing] = useState(false);
  const [modalForm, setModalForm] = useState({ title: "", amount: "", category: "", spentAt: "", note: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modalError, setModalError] = useState("");

  const openModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalEditing(false);
    setModalError("");
    setModalForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      spentAt: expense.spentAt,
      note: expense.note,
    });
  };

  const handleModalSave = async () => {
    if (!modalForm.title || !modalForm.amount) {
      setModalError("Preencha os campos obrigatórios");
      return;
    }
    if (!selectedExpense) return;
    try {
      setModalError("");
      const updatedData = {
        title: modalForm.title,
        amount: parseCurrencyToCents(modalForm.amount),
        category: modalForm.category,
        spentAt: modalForm.spentAt,
        note: modalForm.note,
      };
      
      const updated = await expenseApi.update(selectedExpense.id, updatedData);
      
      setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setSelectedExpense(updated);
      setIsModalEditing(false);
    } catch (err: any) {
      setModalError(err.message || "Erro ao salvar despesa");
    }
  };

  const handleModalDelete = async () => {
    if (!selectedExpense) return;
    try {
      await expenseApi.remove(selectedExpense.id);
      setExpenses((prev) => prev.filter((e) => e.id !== selectedExpense.id));
      setSelectedExpense(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Erro ao deletar", err);
    }
  };

  const resetForm = () => {
    setForm({ spentAt: "", title: "", amount: "", category: "", note: "" });
    setEditing(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount) {
      setError("Preencha os campos obrigatórios");
      return;
    }
    
    try {
      setError("");
      const payload = {
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        spentAt: form.spentAt,
        note: form.note,
      };

      if (editing) {
        const updated = await expenseApi.update(editing, payload);
        setExpenses((prev) => prev.map((exp) => exp.id === editing ? updated : exp));
      } else {
        const created = await expenseApi.create(payload);
        setExpenses((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar despesa");
    }
  };

  const handleEdit = (expense: Expense) => {
    setForm({ spentAt: expense.spentAt, title: expense.title, amount: String(expense.amount), category: expense.category, note: expense.note });
    setEditing(expense.id);
    setShowForm(true);
  };

  const filtered = expenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? e.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    const cents = parseInt(digits || "0", 10);
    return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseCurrencyToCents = (formatted: string): number => {
    const digits = formatted.replace(/\D/g, "");
    return parseInt(digits || "0", 10);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground flex items-center gap-2" style={{ fontWeight: 700 }}>
             Despesas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categoryFilter ? (
              <>Filtrando por: <span className="text-primary" style={{ fontWeight: 600 }}>{categoryFilter}</span> — {filtered.length} despesa(s)</>
            ) : (
              <>{expenses.length} despesas cadastradas</>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {categoryFilter && (
            <Button
              variant="outline"
              onClick={() => setSearchParams({})}
              className="rounded-xl gap-2"
            >
              <X className="w-4 h-4" /> Limpar filtro
            </Button>
          )}
          <Button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
          >
            {showForm ? <><X className="w-4 h-4" /> Fechar</> : <><Plus className="w-4 h-4" /> Nova Despesa</>}
          </Button>
        </div>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="border-border bg-card/80">
              <CardContent className="p-6">
                <h2 className="text-foreground mb-4" style={{ fontWeight: 600 }}>
                  {editing ? "Editar Despesa" : "Nova Despesa"}
                </h2>
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Título</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input className="pl-10 h-10 bg-secondary/50 border-border" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Valor</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" style={{ fontWeight: 600 }}>R$</span>
                      <Input type="text" inputMode="numeric" className="pl-10 h-10 bg-secondary/50 border-border" value={form.amount ? formatCurrency(form.amount) : ""} onChange={(e) => { const digits = e.target.value.replace(/\D/g, ""); setForm({ ...form, amount: digits }); }} placeholder="0,00" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Data</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="date-input" type="date" className="pl-10 h-10 bg-secondary/50 border-border [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" value={form.spentAt} onChange={(e) => setForm({ ...form, spentAt: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Categoria</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <select
                        className="w-full pl-10 h-10 bg-secondary/50 border border-border rounded-md text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring [&>option]:bg-popover [&>option]:text-foreground"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Nota</label>
                    <Input className="h-10 bg-secondary/50 border-border" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2 flex gap-3 pt-2">
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                      {editing ? "Salvar" : "Criar"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">Cancelar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar despesas..." className="pl-10 h-10 bg-secondary/50 border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="border-border bg-card/80">
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3 flex items-center justify-center" style={{ fontWeight: 700, fontSize: "1.5rem" }}>R$</div>
            <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card/80 overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((expense, i) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-secondary/30 transition-colors gap-3 cursor-pointer"
                  onClick={() => openModal(expense)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs text-primary" style={{ fontWeight: 700 }}>R$</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-foreground truncate" style={{ fontWeight: 500 }}>{expense.title}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] ${categoryColors[expense.category] || "bg-secondary text-muted-foreground"}`} style={{ fontWeight: 500 }}>
                          {expense.category || "Sem categoria"}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {expense.spentAt.split("-").reverse().join("/")}
                        </span>
                        {expense.note && <span className="text-[11px] text-muted-foreground">• {expense.note}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-foreground" style={{ fontWeight: 700 }}>
                      R$ {(expense.amount / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* View/Edit Modal */}
      <AnimatePresence>
        {selectedExpense && !showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setSelectedExpense(null); setIsModalEditing(false); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="text-foreground" style={{ fontWeight: 600 }}>
                  {isModalEditing ? "Editar Despesa" : "Detalhes da Despesa"}
                </h3>
                <button onClick={() => { setSelectedExpense(null); setIsModalEditing(false); }} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                {modalError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{modalError}</div>
                )}

                {isModalEditing ? (
                  <>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Título</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10 h-10 bg-secondary/50 border-border" value={modalForm.title} onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Valor</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" style={{ fontWeight: 600 }}>R$</span>
                        <Input type="text" inputMode="numeric" className="pl-10 h-10 bg-secondary/50 border-border" value={modalForm.amount ? formatCurrency(modalForm.amount) : ""} onChange={(e) => { const digits = e.target.value.replace(/\D/g, ""); setModalForm({ ...modalForm, amount: digits }); }} placeholder="0,00" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Data</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="date" className="pl-10 h-10 bg-secondary/50 border-border [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" value={modalForm.spentAt} onChange={(e) => setModalForm({ ...modalForm, spentAt: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Categoria</label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <select
                          className="w-full pl-10 h-10 bg-secondary/50 border border-border rounded-md text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring [&>option]:bg-popover [&>option]:text-foreground"
                          value={modalForm.category}
                          onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                        >
                          <option value="">Selecione uma categoria</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Nota</label>
                      <Input className="h-10 bg-secondary/50 border-border" value={modalForm.note} onChange={(e) => setModalForm({ ...modalForm, note: e.target.value })} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm text-primary" style={{ fontWeight: 700 }}>R$</span>
                      </div>
                      <div>
                        <div className="text-foreground" style={{ fontWeight: 600 }}>{selectedExpense.title}</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] mt-1 ${categoryColors[selectedExpense.category] || "bg-secondary text-muted-foreground"}`} style={{ fontWeight: 500 }}>
                          {selectedExpense.category || "Sem categoria"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-secondary/30 rounded-xl p-3">
                        <div className="text-[11px] text-muted-foreground mb-1" style={{ fontWeight: 500 }}>Valor</div>
                        <div className="text-foreground" style={{ fontWeight: 700 }}>
                          R$ {(selectedExpense.amount / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="bg-secondary/30 rounded-xl p-3">
                        <div className="text-[11px] text-muted-foreground mb-1" style={{ fontWeight: 500 }}>Data</div>
                        <div className="text-foreground text-sm flex items-center gap-1" style={{ fontWeight: 500 }}>
                          <Calendar className="w-3.5 h-3.5" /> {selectedExpense.spentAt.split("-").reverse().join("/")}
                        </div>
                      </div>
                    </div>
                    {selectedExpense.note && (
                      <div className="bg-secondary/30 rounded-xl p-3">
                        <div className="text-[11px] text-muted-foreground mb-1" style={{ fontWeight: 500 }}>Nota</div>
                        <div className="text-foreground text-sm">{selectedExpense.note}</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-5 border-t border-border">
                {isModalEditing ? (
                  <div className="flex gap-2 w-full">
                    <Button onClick={handleModalSave} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex-1">Salvar</Button>
                    <Button variant="outline" onClick={() => { setIsModalEditing(false); setModalError(""); }} className="rounded-xl">Cancelar</Button>
                  </div>
                ) : (
                  <>
                    <Button onClick={() => setIsModalEditing(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2">
                      <Pencil className="w-4 h-4" /> Editar
                    </Button>
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="rounded-xl gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30">
                      <Trash2 className="w-4 h-4" /> Excluir
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <AlertDialogAction onClick={handleModalDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}