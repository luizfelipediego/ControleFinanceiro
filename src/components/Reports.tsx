import React, { useState } from "react";
import { Revenue, Expense } from "../types";
import { MESES_PT, formatarMoeda, formatarData } from "../utils/formatters";
import { FileSpreadsheet, Download, Filter, Calendar } from "lucide-react";

interface ReportsProps {
  receitas: Revenue[];
  despesas: Expense[];
  ano: number;
  mes: number;
}

export const Reports: React.FC<ReportsProps> = ({ receitas, despesas, ano, mes }) => {
  const [periodoMode, setPeriodoMode] = useState<"mensal" | "anual">("mensal");

  const totalReceitas = receitas.reduce((s, r) => s + r.valor, 0);
  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  // Export CSV helper
  const exportCSV = () => {
    const headers = ["Tipo", "Data", "Descrição/Origem", "Categoria", "Caixa", "Responsável", "Valor"];
    const rows: string[][] = [];

    receitas.forEach((r) => {
      rows.push(["Receita", r.data, `"${r.origem}"`, "-", r.caixa, "-", r.valor.toFixed(2)]);
    });

    despesas.forEach((d) => {
      rows.push([
        "Despesa",
        d.data_compra,
        `"${d.descricao}"`,
        `"${d.categoria_nome || ""}"`,
        d.caixa,
        d.responsavel,
        (-d.valor).toFixed(2),
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Controle_Financeiro_${MESES_PT[mes]}_${ano}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON helper
  const exportJSON = () => {
    const dataObj = {
      periodo: `${MESES_PT[mes]}/${ano}`,
      receitas,
      despesas,
      resumo: {
        totalReceitas,
        totalDespesas,
        saldo,
      },
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataObj, null, 2))}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `Controle_Financeiro_${MESES_PT[mes]}_${ano}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-400" />
            📁 Relatórios, Filtros e Exportação
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Consolidação dos dados financeiros e exportação de extratos brutos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <button
            onClick={exportJSON}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-teal-400" /> Exportar JSON
          </button>
        </div>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">Receitas Consolidadas</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">{formatarMoeda(totalReceitas)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">Despesas Consolidadas</span>
          <p className="text-xl font-bold text-rose-400 mt-1">{formatarMoeda(totalDespesas)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">Resultado do Período</span>
          <p className={`text-xl font-bold mt-1 ${saldo >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {formatarMoeda(saldo)}
          </p>
        </div>
      </div>

      {/* Raw Data Preview Table */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm">Visão Unificada de Lançamentos ({receitas.length + despesas.length})</h3>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3">Tipo</th>
                <th className="p-3">Data</th>
                <th className="p-3">Descrição / Origem</th>
                <th className="p-3">Caixa</th>
                <th className="p-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {receitas.map((r) => (
                <tr key={`rec_${r.id}`} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      ENTRADA
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{formatarData(r.data)}</td>
                  <td className="p-3 font-medium text-slate-100">{r.origem}</td>
                  <td className="p-3 text-slate-400">{r.caixa}</td>
                  <td className="p-3 text-right font-bold text-emerald-400">{formatarMoeda(r.valor)}</td>
                </tr>
              ))}
              {despesas.map((d) => (
                <tr key={`desp_${d.id}`} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">
                      SAÍDA
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{formatarData(d.data_compra)}</td>
                  <td className="p-3 font-medium text-slate-100">{d.descricao}</td>
                  <td className="p-3 text-slate-400">{d.caixa}</td>
                  <td className="p-3 text-right font-bold text-rose-400">-{formatarMoeda(d.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
