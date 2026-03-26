import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Pencil, Trash2, Tags, Tag, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { categoryApi, CategoryResponse } from "../../api/categoryApi";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";

type Category = CategoryResponse;

const colors = [
  "from-primary/20 to-primary/5 border-primary/20",
  "from-[#22d3ee]/20 to-[#22d3ee]/5 border-[#22d3ee]/20",
  "from-[#a78bfa]/20 to-[#a78bfa]/5 border-[#a78bfa]/20",
  "from-[#10b981]/20 to-[#10b981]/5 border-[#10b981]/20",
  "from-[#f59e0b]/20 to-[#f59e0b]/5 border-[#f59e0b]/20",
  "from-[#ef4444]/20 to-[#ef4444]/5 border-[#ef4444]/20",
];

export function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => { setName(""); setEditing(null); setShowForm(false); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Nome é obrigatório"); return; }
    
    try {
      setError("");
      if (editing) {
        const updated = await categoryApi.update(editing, name.trim(), "geral");
        setCategories((prev) => prev.map((c) => c.id === editing ? updated : c));
      } else {
        const created = await categoryApi.create(name.trim(), "geral");
        setCategories((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar categoria");
    }
  };

  const handleEdit = (cat: Category) => { setName(cat.name); setEditing(cat.id); setShowForm(true); };
  const handleDelete = async (id: number) => {
    try {
      await categoryApi.remove(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Erro ao excluir", err);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground flex items-center gap-2" style={{ fontWeight: 700 }}>
            <Tags className="w-6 h-6 text-primary" /> Categorias
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} categorias cadastradas</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2">
          {showForm ? <><X className="w-4 h-4" /> Fechar</> : <><Plus className="w-4 h-4" /> Nova Categoria</>}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="border-border bg-card/80">
              <CardContent className="p-6">
                <h2 className="text-foreground mb-4" style={{ fontWeight: 600 }}>{editing ? "Editar Categoria" : "Nova Categoria"}</h2>
                {error && <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="flex gap-3 max-w-md">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Nome da categoria" className="pl-10 h-10 bg-secondary/50 border-border" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">{editing ? "Salvar" : "Criar"}</Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {categories.length === 0 ? (
        <Card className="border-border bg-card/80">
          <CardContent className="p-12 text-center">
            <Tags className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <div
                className={`group p-4 rounded-xl border bg-linear-to-br ${colors[i % colors.length]} flex items-center justify-between hover:scale-[1.02] transition-all duration-200 cursor-pointer`}
                onClick={() => navigate(`/expenses?category=${encodeURIComponent(cat.name)}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-foreground/70" />
                  </div>
                  <span className="text-sm text-foreground" style={{ fontWeight: 500 }}>{cat.name}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); handleEdit(cat); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}