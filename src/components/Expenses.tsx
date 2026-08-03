import React, { useState } from "react";
import {
  Expense,
  FixedExpense,
  Category,
  CreditCard,
  CaixaType,
  ResponsiblePerson,
  PaymentMethod,
} from "../types";
import { formatarMoeda, formatarData, MESES_PT } from "../utils/formatters";
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  CreditCard as CardIcon,
  Repeat,
  Zap,
  CheckCircle,
  XCircle,
  Search,
  X,
  Filter,
} from "lucide-react";

interface ExpensesProps {
  despesas: Expense[];
  despesasFixas: FixedExpense[];
  categorias: Category[];
  cartoes: CreditCard[];
  ano: number;
  mes: number;
  onAddDespesa: (despesa: any) => void;
  onDeleteDespesa: (id: number) => void;
  onAddDespesaFixa: (fixa: any) => void;
  onToggleDespesaFixa: (id: number) => void;
  onDeleteDespesaFixa: (id: number) => void;
  onAddCartao: (cartao: any) => void;
  onDeleteCartao: (id: number) => void;
}

export const Expenses: React.FC<ExpensesProps> = ({
  despesas,
  despesasFixas,
  categorias,
  cartoes,
  ano,
  mes,
  onAddDespesa,
  onDeleteDespesa,
  onAddDespesaFixa,
  onToggleDespesaFixa,
  onDeleteDespesaFixa,
  onAddCartao,
  onDeleteCartao,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"lancar" | "fixas" | "cartoes">("lancar");

  // Form states for Nova Despesa
  const [dataCompra, setDataCompra] = useState(new Date().toISOString().slice(0, 10));
  const [categoriaId, setCategoriaId] = useState<number>(categorias[0]?.id || 1);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<PaymentMethod>("Cartão de Crédito");
  const [cartaoId, setCartaoId] = useState<number | undefined>(cartoes[0]?.id);
  const [caixa, setCaixa] = useState<CaixaType>("PF (Pessoal)");
  const [responsavel, setResponsavel] = useState<ResponsiblePerson>("Conjunto");
  const [totalParcelas, setTotalParcelas] = useState("1");

  // Form states for Fixed Expense
  const [fixaDescricao, setFixaDescricao] = useState("");
  const [fixaCategoriaId, setFixaCategoriaId] = useState<number>(categorias[0]?.id || 1);
  const [fixaValor, setFixaValor] = useState("");
  const [fixaForma, setFixaForma] = useState<PaymentMethod>("Boleto/Transferência");
  const [fixaCartaoId, setFixaCartaoId] = useState<number | undefined>(cartoes[0]?.id);
  const [fixaDia, setFixaDia] = useState("10");

  // Form states for Card
  const [cartaoNome, setCartaoNome] = useState("");
  const [cartaoBanco, setCartaoBanco] = useState("");
  const [cartaoFechamento, setCartaoFechamento] = useState("20");
  const [cartaoVencimento, setCartaoVencimento] = useState("5");

  // Filter states for Despesas list
  const [filterQuery, setFilterQuery] = useState("");
  const [filterResp, setFilterResp] = useState("Todos");
  const [filterForma, setFilterForma] = useState("Todas");
  const [filterCat, setFilterCat] = useState("Todas");
  const [filterCaixa, setFilterCaixa] = useState("Todos");

  const despesasFiltradas = despesas.filter((d) => {
    const matchText =
      d.descricao.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (d.categoria_nome && d.categoria_nome.toLowerCase().includes(filterQuery.toLowerCase()));
    const matchResp = filterResp === "Todos" || d.responsavel === filterResp;
    const matchForma = filterForma === "Todas" || d.forma_pagamento === filterForma;
    const matchCat = filterCat === "Todas" || String(d.categoria_id) === filterCat;
    const matchCaixa = filterCaixa === "Todos" || d.caixa === filterCaixa;
    return matchText && matchResp && matchForma && matchCat && matchCaixa;
  });

  const limparFiltros = () => {
    setFilterQuery("");
    setFilterResp("Todos");
    setFilterForma("Todas");
    setFilterCat("Todas");
    setFilterCaixa("Todos");
  };

  const handleAddDespesaSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddDespesa({
      data_compra: dataCompra,
      categoria_id: categoriaId,
      descricao,
      valor: parseFloat(valor) || 0,
      forma_pagamento: formaPagamento,
      cartao_id: formaPagamento === "Cartão de Crédito" ? (cartaoId || cartoes[0]?.id || null) : null,
      caixa,
      responsavel,
      total_parcelas: (formaPagamento === "Cartão de Crédito" || formaPagamento === "Financiamento" || formaPagamento === "Boleto/Transferência") ? (parseInt(totalParcelas) || 1) : 1,
    });

    if (descricao && valor && parseFloat(valor) > 0) {
      setDescricao("");
      setValor("");
      setTotalParcelas("1");
    }
  };

  const handleAddFixaSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddDespesaFixa({
      descricao: fixaDescricao,
      categoria_id: fixaCategoriaId,
      valor: parseFloat(fixaValor) || 0,
      forma_pagamento: fixaForma,
      cartao_id: fixaForma === "Cartão de Crédito" ? fixaCartaoId : null,
      dia_vencimento: parseInt(fixaDia) || 5,
      caixa,
      responsavel,
    });

    if (fixaDescricao && fixaValor && parseFloat(fixaValor) > 0) {
      setFixaDescricao("");
      setFixaValor("");
    }
  };

  const handleAddCartaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartaoNome) return;

    onAddCartao({
      nome: cartaoNome,
      banco: cartaoBanco || "Banco",
      dia_fechamento: parseInt(cartaoFechamento) || 20,
      dia_vencimento: parseInt(cartaoVencimento) || 5,
    });

    setCartaoNome("");
    setCartaoBanco("");
  };

  return (
    <div className="space-y-6">
      {/* Navigation Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-rose-500" />
          <div>
            <h2 className="text-lg font-bold text-white">Despesas e Responsabilidades</h2>
            <p className="text-xs text-slate-400">Lançamentos variáveis, gastos fixos mensais e cartões</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveSubTab("lancar")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === "lancar" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📝 Lançar Despesa
          </button>
          <button
            onClick={() => setActiveSubTab("fixas")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === "fixas" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🔁 Despesas Fixas ({despesasFixas.length})
          </button>
          <button
            onClick={() => setActiveSubTab("cartoes")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === "cartoes" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            💳 Cartões de Crédito ({cartoes.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Lançar Despesa */}
      {activeSubTab === "lancar" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" />
              Lançar Nova Despesa
            </h3>

            <form onSubmit={handleAddDespesaSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Data da Compra</label>
                <input
                  type="date"
                  value={dataCompra}
                  onChange={(e) => setDataCompra(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Mercado, Combustível, Jantar..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Categoria</label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-rose-400 font-bold focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Forma de Pagamento</label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="À Vista (Pix/Dinheiro)">À Vista (Pix/Dinheiro)</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Boleto/Transferência">Boleto/Transferência</option>
                  <option value="Financiamento">Financiamento</option>
                </select>
              </div>

              {formaPagamento === "Cartão de Crédito" && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Cartão Utilizado</label>
                  <select
                    value={cartaoId || (cartoes[0]?.id || "")}
                    onChange={(e) => setCartaoId(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {cartoes.length === 0 ? (
                      <option value="">Nenhum cartão cadastrado</option>
                    ) : (
                      cartoes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome} (Fecha dia {c.dia_fechamento})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {(formaPagamento === "Cartão de Crédito" || formaPagamento === "Financiamento" || formaPagamento === "Boleto/Transferência") && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Número de Vezes (Parcelas)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="420"
                      value={totalParcelas}
                      onChange={(e) => setTotalParcelas(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-rose-500 min-h-[38px]"
                      placeholder="Ex: 1, 10, 12..."
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 pointer-events-none font-medium">
                      {parseInt(totalParcelas) > 1 ? `${totalParcelas}x` : "À vista (1x)"}
                    </span>
                  </div>
                  {parseInt(totalParcelas) > 1 && valor && parseFloat(valor) > 0 && (
                    <p className="text-[10px] text-emerald-400 font-medium mt-1">
                      ⚡ {parseInt(totalParcelas)}x de {formatarMoeda(parseFloat(valor) / parseInt(totalParcelas))} / mês
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Caixa / Origem</label>
                <select
                  value={caixa}
                  onChange={(e) => setCaixa(e.target.value as CaixaType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="PF (Pessoal)">PF (Pessoal)</option>
                  <option value="PJ (Empresa)">PJ (Empresa)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Responsável</label>
                <select
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value as ResponsiblePerson)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Conjunto">Conjunto</option>
                  <option value="Titular">Titular</option>
                  <option value="Família">Família</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end mt-2">
                <button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-400 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Salvar Lançamento
                </button>
              </div>
            </form>
          </div>

          {/* List of current month expenses */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-slate-100 text-sm">
                Despesas da Competência de {MESES_PT[mes]}/{ano} ({despesasFiltradas.length} de {despesas.length})
              </h3>
            </div>

            {/* Advanced Filters Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
              <div className="relative sm:col-span-2 md:col-span-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar lançamento..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Todas">Categoria: Todas</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterResp}
                  onChange={(e) => setFilterResp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Todos">Responsável: Todos</option>
                  <option value="Conjunto">Conjunto</option>
                  <option value="Titular">Titular</option>
                  <option value="Família">Família</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <select
                  value={filterForma}
                  onChange={(e) => setFilterForma(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Todas">Pagamento: Todos</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="À Vista (Pix/Dinheiro)">À Vista (Pix/Dinheiro)</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Boleto/Transferência">Boleto/Transferência</option>
                  <option value="Financiamento">Financiamento</option>
                </select>
              </div>

              <div>
                <select
                  value={filterCaixa}
                  onChange={(e) => setFilterCaixa(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Todos">Caixa: Todos</option>
                  <option value="PF (Pessoal)">PF (Pessoal)</option>
                  <option value="PJ (Empresa)">PJ (Empresa)</option>
                </select>
              </div>

              <div className="flex items-center">
                <button
                  onClick={limparFiltros}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 border border-slate-700"
                >
                  <X className="w-3.5 h-3.5" /> Limpar
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="p-3">Data Compra</th>
                    <th className="p-3">Descrição</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Forma / Cartão</th>
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
                        Nenhuma despesa encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    despesasFiltradas.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 whitespace-nowrap text-slate-400">{formatarData(d.data_compra)}</td>
                        <td className="p-3 font-medium text-slate-100">{d.descricao}</td>
                        <td className="p-3 text-slate-300">{d.categoria_nome}</td>
                        <td className="p-3 text-slate-300">{d.cartao_nome || d.forma_pagamento}</td>
                        <td className="p-3">
                          {d.total_parcelas && d.total_parcelas > 1 ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                              {d.parcela_atual}/{d.total_parcelas}
                            </span>
                          ) : (
                            <span className="text-slate-500">1/1</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400">{d.caixa}</td>
                        <td className="p-3 text-slate-400">{d.responsavel}</td>
                        <td className="p-3 text-right font-bold text-rose-400 whitespace-nowrap">
                          {formatarMoeda(d.valor)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => onDeleteDespesa(d.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
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
      )}

      {/* SUBTAB 2: Despesas Fixas */}
      {activeSubTab === "fixas" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Repeat className="w-4 h-4 text-emerald-400" />
              Cadastrar Despesa Recorrente (Fixa)
            </h3>

            <form onSubmit={handleAddFixaSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Aluguel, Plano de Saúde, Internet..."
                  value={fixaDescricao}
                  onChange={(e) => setFixaDescricao(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Categoria</label>
                <select
                  value={fixaCategoriaId}
                  onChange={(e) => setFixaCategoriaId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Valor Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={fixaValor}
                  onChange={(e) => setFixaValor(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Dia Vencimento</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={fixaDia}
                  onChange={(e) => setFixaDia(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow transition-all active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Adicionar Despesa Fixa
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Despesas Fixas Ativas</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {despesasFixas.map((f) => (
                <div
                  key={f.id}
                  className={`p-4 rounded-xl border ${
                    f.ativa ? "bg-slate-800/60 border-slate-700" : "bg-slate-900/40 border-slate-800 opacity-60"
                  } flex items-center justify-between gap-3`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      {f.descricao}
                      {f.ativa ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                          Ativa
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                          Pausada
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {f.categoria_nome} • Vencimento dia {f.dia_vencimento} ({f.caixa})
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <p className="font-bold text-slate-100 text-sm">{formatarMoeda(f.valor)}</p>
                    <button
                      onClick={() => onToggleDespesaFixa(f.id)}
                      className="text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Ativar / Pausar"
                    >
                      {f.ativa ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => onDeleteDespesaFixa(f.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Cartões de Crédito */}
      {activeSubTab === "cartoes" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <CardIcon className="w-4 h-4 text-emerald-400" />
              Cadastrar Cartão de Crédito
            </h3>

            <form onSubmit={handleAddCartaoSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Cartão</label>
                <input
                  type="text"
                  placeholder="Ex: Cartão Itaú Black, Nubank..."
                  value={cartaoNome}
                  onChange={(e) => setCartaoNome(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Banco Emissor</label>
                <input
                  type="text"
                  placeholder="Ex: Itaú Unibanco, Bradesco..."
                  value={cartaoBanco}
                  onChange={(e) => setCartaoBanco(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Dia Fechamento Fatura</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={cartaoFechamento}
                  onChange={(e) => setCartaoFechamento(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Dia Vencimento Fatura</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={cartaoVencimento}
                  onChange={(e) => setCartaoVencimento(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow transition-all active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Adicionar Cartão
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cartoes.map((c) => (
              <div
                key={c.id}
                className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/80 p-5 rounded-2xl relative overflow-hidden shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{c.banco}</span>
                  <button
                    onClick={() => onDeleteCartao(c.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-lg font-bold text-white mb-2">{c.nome}</h4>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/60 pt-3">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Fechamento</span>
                    <span className="font-semibold text-slate-200">Dia {c.dia_fechamento}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-500 uppercase">Vencimento</span>
                    <span className="font-semibold text-slate-200">Dia {c.dia_vencimento}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
