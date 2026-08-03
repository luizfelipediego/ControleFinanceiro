import React, { useState } from "react";
import { Category } from "../types";
import { formatarMoeda } from "../utils/formatters";
import { Tags, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";

interface CategoriesProps {
  categorias: Category[];
  onAddCategoria: (cat: { nome: string; teto_mensal: number }) => void;
  onUpdateCategoriaTeto: (id: number, teto: number) => void;
  onDeleteCategoria: (id: number) => void;
}

export const Categories: React.FC<CategoriesProps> = ({
  categorias,
  onAddCategoria,
  onUpdateCategoriaTeto,
  onDeleteCategoria,
}) => {
  const [nome, setNome] = useState("");
  const [teto, setTeto] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTetoVal, setEditTetoVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddCategoria({
      nome,
      teto_mensal: parseFloat(teto) || 0,
    });

    if (nome) {
      setNome("");
      setTeto("");
    }
  };

  const handleSaveEdit = (id: number) => {
    onUpdateCategoriaTeto(id, parseFloat(editTetoVal) || 0);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tags className="w-5 h-5 text-amber-400" />
            🏷️ Categorias e Teto de Gastos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Defina limites orçamentários mensais para receber alertas automáticos de estouro
          </p>
        </div>
      </div>

      {/* Form: Add Category */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-400" />
          Nova Categoria de Despesa
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nome da Categoria</label>
            <input
              type="text"
              placeholder="Ex: Viagens, Pets, Educação..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Teto Mensal Estimado (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00 (0 para sem limite)"
              value={teto}
              onChange={(e) => setTeto(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Cadastrar Categoria
            </button>
          </div>
        </form>
      </div>

      {/* Categories Grid */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm">Categorias Cadastradas ({categorias.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categorias.map((cat) => (
            <div key={cat.id} className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100">{cat.nome}</span>
                <button
                  onClick={() => onDeleteCategoria(cat.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-700/60">
                <span className="text-slate-400">Teto Mensal:</span>
                {editingId === cat.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editTetoVal}
                      onChange={(e) => setEditTetoVal(e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-0.5 text-xs text-amber-400 font-bold"
                    />
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">{formatarMoeda(cat.teto_mensal)}</span>
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditTetoVal(cat.teto_mensal.toString());
                      }}
                      className="text-slate-500 hover:text-amber-400"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
