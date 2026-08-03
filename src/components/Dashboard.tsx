import React, { useState } from "react";
import { DashboardSummary, Expense, CaixaType } from "../types";
import { formatarMoeda, corStatusTeto, MESES_PT } from "../utils/formatters";
import { EmancipationSimulator } from "./EmancipationSimulator";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  PiggyBank,
  AlertTriangle,
  Award,
  CreditCard,
  Building,
  CheckCircle2,
  Trash2,
  Edit2,
  Layers,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  Percent,
  Filter,
  X,
  Search,
  LineChart as LineIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardProps {
  summary: DashboardSummary | null;
  despesas: Expense[];
  ano: number;
  mes: number;
  caixaSel: CaixaType;
  onRefresh: () => void;
  onDeleteDespesa: (id: number) => void;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1"];

export const Dashboard: React.FC<DashboardProps> = ({
  summary,
  despesas,
  ano,
  mes,
  caixaSel,
  onRefresh,
  onDeleteDespesa,
}) => {
  const [purchaseTab, setPurchaseTab] = useState<"avista" | "parcelado" | "financiamento">("parcelado");
  const [filterQuery, setFilterQuery] = useState("");
  const [filterResp, setFilterResp] = useState("Todos");
  const [filterForma, setFilterForma] = useState("Todas");
  const [filterCaixa, setFilterCaixa] = useState("Todos");

  if (!summary) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Carregando informações financeiras...
      </div>
    );
  }

  // Filter purchases for tracking tab with multi-attribute search
  const despesasFiltradas = despesas
    .filter((d) => {
      if (purchaseTab === "avista") return d.total_parcelas === 1 && d.forma_pagamento !== "Financiamento";
      if (purchaseTab === "parcelado") return (d.total_parcelas || 1) > 1 && d.forma_pagamento !== "Financiamento";
      if (purchaseTab === "financiamento") return d.forma_pagamento === "Financiamento" || d.is_financiamento;
      return true;
    })
    .filter((d) => {
      const matchesText =
        d.descricao.toLowerCase().includes(filterQuery.toLowerCase()) ||
        (d.categoria_nome && d.categoria_nome.toLowerCase().includes(filterQuery.toLowerCase()));
      const matchesResp = filterResp === "Todos" || d.responsavel === filterResp;
      const matchesForma = filterForma === "Todas" || d.forma_pagamento === filterForma;
      const matchesCaixa = filterCaixa === "Todos" || d.caixa === filterCaixa;
      return matchesText && matchesResp && matchesForma && matchesCaixa;
    });

  const limparFiltros = () => {
    setFilterQuery("");
    setFilterResp("Todos");
    setFilterForma("Todas");
    setFilterCaixa("Todos");
  };

  // Prepare Recharts data
  const pieData = summary.gastos_por_categoria
    .filter((c) => c.gasto > 0)
    .map((c) => ({
      name: c.nome,
      value: c.gasto,
    }));

  const barRespData = summary.gastos_por_responsavel.map((r) => ({
    responsavel: r.responsavel,
    valor: r.valor,
  }));

  const barCaixaData = summary.gastos_por_caixa.map((cx) => ({
    caixa: cx.caixa,
    Receitas: cx.receitas,
    Despesas: cx.despesas,
    Saldo: cx.saldo,
  }));

  const percentEmancipacao = Math.min(
    100,
    Math.round((summary.fundo_emancipacao_acumulado / summary.fundo_emancipacao_meta) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📊 Visão Geral — {MESES_PT[mes]}/{ano}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fluxo Selecionado: <span className="text-emerald-400 font-semibold">{caixaSel}</span>
          </p>
        </div>

        {/* Proventos / Passive Income highlight badge */}
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400">
          <TrendingUp className="w-5 h-5" />
          <div>
            <p className="text-[10px] text-emerald-400/80 font-medium uppercase tracking-wider">Proventos e FIIs no Mês</p>
            <p className="font-bold text-base">{formatarMoeda(summary.proventos_renda_passiva)}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Receitas */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Receitas Totais</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{formatarMoeda(summary.total_receitas)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Entradas em {MESES_PT[mes]}</p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Total Despesas */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Despesas Totais</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{formatarMoeda(summary.total_despesas)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Competência de {MESES_PT[mes]}</p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Saldo Liquido */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Saldo Líquido</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${summary.saldo_liquido >= 0 ? "bg-teal-500/10 text-teal-400" : "bg-rose-500/10 text-rose-400"}`}>
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-2 ${summary.saldo_liquido >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {formatarMoeda(summary.saldo_liquido)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Receitas menos Despesas</p>
        </div>

        {/* Meta de Reserva / Investimento */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Meta de Reserva ({summary.meta_reserva_percentual}%)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{formatarMoeda(summary.meta_reserva_valor)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Economia mensal recomendada</p>
        </div>
      </div>

      {/* Emancipation Fund Progress Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">🚀 Fundo de Emancipação (Projeto 18 Anos)</h3>
              <p className="text-xs text-slate-400">Patrimônio acumulado para independência financeira dos filhos</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-emerald-400">{formatarMoeda(summary.fundo_emancipacao_acumulado)}</span>
            <span className="text-xs text-slate-400"> / {formatarMoeda(summary.fundo_emancipacao_meta)}</span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentEmancipacao}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
          <span>Progresso do Objetivo</span>
          <span className="font-semibold text-emerald-400">{percentEmancipacao}% concluído</span>
        </div>
      </div>

      {/* Item 5: Interactive Emancipation & Projection Simulator */}
      <EmancipationSimulator
        saldoAtualInicial={summary.fundo_emancipacao_acumulado}
        metaInicial={summary.fundo_emancipacao_meta}
      />

      {/* Item 2: 6-Month Historical Evolution Chart */}
      {summary.evolucao_mensal && summary.evolucao_mensal.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <LineIcon className="w-4 h-4 text-emerald-400" />
                📈 Evolução Temporal dos Últimos 6 Meses
              </h3>
              <p className="text-xs text-slate-400">Comparativo histórico de Receitas vs Despesas e Saldo Líquido</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Receitas
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" /> Despesas
              </span>
              <span className="flex items-center gap-1.5 text-teal-300 font-medium">
                <span className="w-3 h-3 rounded-full bg-teal-400 inline-block" /> Saldo Líquido
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={summary.evolucao_mensal}>
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: number) => [formatarMoeda(val)]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo Líquido"
                  stroke="#2dd4bf"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#2dd4bf" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Spend Limit Alerts (Alertas Preditivos de Teto de Gastos) */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            🚦 Alertas Preditivos de Teto de Gastos
          </h3>
          <span className="text-xs text-slate-400">Acompanhamento por Categoria</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {summary.alertas_teto.map((cat) => {
            const st = corStatusTeto(cat.percentual);
            return (
              <div
                key={cat.categoria_id}
                className={`p-3.5 rounded-xl bg-slate-800/60 border ${st.border} space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-slate-200">{cat.nome}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${st.badge}`}>
                    {cat.percentual}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">Gasto: <strong className="text-slate-200">{formatarMoeda(cat.gasto)}</strong></span>
                  <span className="text-slate-500">Teto: {formatarMoeda(cat.teto)}</span>
                </div>

                <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${st.bg} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(100, cat.percentual)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Gastos por Categoria */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-400" />
            Distribuição de Gastos por Categoria
          </h3>
          {pieData.length === 0 ? (
            <p className="text-xs text-slate-500 py-12 text-center">Nenhuma despesa registrada para o período.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [formatarMoeda(val), "Gasto"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#f8fafc", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart: Divisão por Responsável */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-400" />
            Divisão de Gastos por Responsável
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barRespData}>
                <XAxis dataKey="responsavel" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  formatter={(val: number) => [formatarMoeda(val), "Valor"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#f8fafc", fontSize: "12px" }}
                />
                <Bar dataKey="valor" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Item 1: Purchase Tracking & Advanced Real-Time Filters */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              📋 Acompanhamento de Compras e Parcelamentos
            </h3>
            <p className="text-xs text-slate-400">Detalhamento dos lançamentos com busca e filtros em tempo real</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setPurchaseTab("parcelado")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                purchaseTab === "parcelado" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📦 Parcelado Cartão
            </button>
            <button
              onClick={() => setPurchaseTab("avista")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                purchaseTab === "avista" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              💳 À Vista Cartão / Pix
            </button>
            <button
              onClick={() => setPurchaseTab("financiamento")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                purchaseTab === "financiamento" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🏦 Financiamentos
            </button>
          </div>
        </div>

        {/* Item 1: Advanced Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
          {/* Text Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filter Responsavel */}
          <div>
            <select
              value={filterResp}
              onChange={(e) => setFilterResp(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Todos">Responsável: Todos</option>
              <option value="Conjunto">Conjunto</option>
              <option value="Titular">Titular</option>
              <option value="Família">Família</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* Filter Forma Pagamento */}
          <div>
            <select
              value={filterForma}
              onChange={(e) => setFilterForma(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Todas">Pagamento: Todos</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="À Vista (Pix/Dinheiro)">À Vista (Pix/Dinheiro)</option>
              <option value="Boleto/Transferência">Boleto/Transferência</option>
              <option value="Financiamento">Financiamento</option>
            </select>
          </div>

          {/* Filter Caixa */}
          <div>
            <select
              value={filterCaixa}
              onChange={(e) => setFilterCaixa(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Todos">Caixa: Todos</option>
              <option value="PF (Pessoal)">PF (Pessoal)</option>
              <option value="PJ (Empresa)">PJ (Empresa)</option>
            </select>
          </div>

          {/* Clear Filters button */}
          <div className="flex items-center">
            <button
              onClick={limparFiltros}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <X className="w-3.5 h-3.5" /> Limpar Filtros
            </button>
          </div>
        </div>

        {/* Purchase Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Descrição</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Cartão / Forma</th>
                <th className="p-3">Parcela</th>
                <th className="p-3">Caixa</th>
                <th className="p-3">Responsável</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {despesasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500">
                    Nenhuma compra encontrada nesta aba.
                  </td>
                </tr>
              ) : (
                despesasFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 whitespace-nowrap text-slate-400">{item.data_compra}</td>
                    <td className="p-3 font-medium text-slate-100">{item.descricao}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                        {item.categoria_nome || "Geral"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{item.cartao_nome || item.forma_pagamento}</td>
                    <td className="p-3">
                      {item.total_parcelas && item.total_parcelas > 1 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[11px]">
                          {item.parcela_atual}/{item.total_parcelas}
                        </span>
                      ) : (
                        <span className="text-slate-500">1/1</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${item.caixa === 'PJ (Empresa)' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-300'}`}>
                        {item.caixa}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{item.responsavel}</td>
                    <td className="p-3 text-right font-bold text-rose-400 whitespace-nowrap">
                      {formatarMoeda(item.valor)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeleteDespesa(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Excluir despesa"
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
