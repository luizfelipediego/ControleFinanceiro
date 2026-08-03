import React, { useState } from "react";
import { Revenue, CaixaType } from "../types";
import { formatarMoeda, formatarData, MESES_PT } from "../utils/formatters";
import { TrendingUp, Plus, Trash2, Search } from "lucide-react";

interface RevenuesProps {
  receitas: Revenue[];
  ano: number;
  mes: number;
  onAddReceita: (receita: Omit<Revenue, "id">) => void;
  onDeleteReceita: (id: number) => void;
}

export const Revenues: React.FC<RevenuesProps> = ({
  receitas,
  ano,
  mes,
  onAddReceita,
  onDeleteReceita,
}) => {
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [origem, setOrigem] = useState("");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [caixa, setCaixa] = useState<CaixaType>("PF (Pessoal)");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCaixa, setFilterCaixa] = useState("Todos");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedVal = parseFloat(valor.replace(",", ".")) || 0;

    onAddReceita({
      data,
      origem,
      valor: parsedVal,
      observacao,
      caixa,
    });

    if (origem.trim() && parsedVal > 0) {
      setOrigem("");
      setValor("");
      setObservacao("");
    }
  };

  const totalProventosMes = receitas.reduce((sum, r) => sum + r.valor, 0);

  const receitasFiltradas = receitas.filter((r) => {
    const matchText =
      r.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.observacao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCaixa = filterCaixa === "Todos" || r.caixa === filterCaixa;
    return matchText && matchCaixa;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            📥 Receitas e Entradas ({MESES_PT[mes]}/{ano})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestão do fluxo de entrada pessoal (PF) e empresarial (PJ / Empresa)
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-emerald-400 font-semibold text-right">
          <p className="text-[10px] text-emerald-400/80 uppercase tracking-wider font-medium">Total de Entradas</p>
          <p className="text-lg font-bold">{formatarMoeda(totalProventosMes)}</p>
        </div>
      </div>

      {/* Form: Nova Entrada */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          Registrar Nova Entrada / Provento
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Origem / Fonte</label>
            <input
              type="text"
              placeholder="Ex: Pró-Labore, Proventos FIIs..."
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Caixa / Destino</label>
            <select
              value={caixa}
              onChange={(e) => setCaixa(e.target.value as CaixaType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="PF (Pessoal)">PF (Pessoal)</option>
              <option value="PJ (Empresa)">PJ (Empresa)</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-medium text-slate-400 mb-1">Observação / Detalhes</label>
            <input
              type="text"
              placeholder="Opcional: nota fiscal, mês de referência, ativo..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Cadastrar Entrada
            </button>
          </div>
        </form>
      </div>

      {/* Revenues Table */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-100 text-sm">
            Lista de Receitas em {MESES_PT[mes]}/{ano} ({receitasFiltradas.length})
          </h3>

          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar por origem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Origem</th>
                <th className="p-3">Caixa</th>
                <th className="p-3">Observação</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {receitasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    Nenhuma receita lançada para este período.
                  </td>
                </tr>
              ) : (
                receitasFiltradas.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 whitespace-nowrap text-slate-400">{formatarData(r.data)}</td>
                    <td className="p-3 font-medium text-slate-100">{r.origem}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          r.caixa === "PJ (Empresa)"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {r.caixa}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{r.observacao || "-"}</td>
                    <td className="p-3 text-right font-bold text-emerald-400 whitespace-nowrap">
                      {formatarMoeda(r.valor)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeleteReceita(r.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Excluir receita"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
