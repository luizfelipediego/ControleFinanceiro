import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Sidebar, NavTab } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Revenues } from "./components/Revenues";
import { Expenses } from "./components/Expenses";
import { Categories } from "./components/Categories";
import { Reports } from "./components/Reports";
import { Settings } from "./components/Settings";
import { AuthModal } from "./components/AuthModal";
import { AuthScreen } from "./components/AuthScreen";
import { ToastNotification, ToastMessage } from "./components/ToastNotification";
import {
  DashboardSummary,
  Expense,
  FixedExpense,
  Revenue,
  Category,
  CreditCard,
  AppConfig,
  CaixaType,
} from "./types";

export function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [anoSel, setAnoSel] = useState<number>(new Date().getFullYear());
  const [mesSel, setMesSel] = useState<number>(new Date().getMonth() + 1);
  const [caixaSel, setCaixaSel] = useState<CaixaType>("Consolidado");

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [despesas, setDespesas] = useState<Expense[]>([]);
  const [despesasFixas, setDespesasFixas] = useState<FixedExpense[]>([]);
  const [receitas, setReceitas] = useState<Revenue[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [cartoes, setCartoes] = useState<CreditCard[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "info", title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: String(Date.now() + Math.random()),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadAllData = async () => {
    if (!user) return;
    try {
      const [dashRes, despRes, fixasRes, recRes, catRes, cartRes, cfgRes] = await Promise.all([
        fetch(`/api/dashboard?ano=${anoSel}&mes=${mesSel}&caixa=${encodeURIComponent(caixaSel)}`),
        fetch(`/api/despesas?ano=${anoSel}&mes=${mesSel}`),
        fetch("/api/despesas-fixas"),
        fetch(`/api/receitas?ano=${anoSel}&mes=${mesSel}`),
        fetch("/api/categorias"),
        fetch("/api/cartoes"),
        fetch("/api/config"),
      ]);

      if (dashRes.ok && dashRes.headers.get("content-type")?.includes("application/json")) setSummary(await dashRes.json());
      if (despRes.ok && despRes.headers.get("content-type")?.includes("application/json")) setDespesas(await despRes.json());
      if (fixasRes.ok && fixasRes.headers.get("content-type")?.includes("application/json")) setDespesasFixas(await fixasRes.json());
      if (recRes.ok && recRes.headers.get("content-type")?.includes("application/json")) setReceitas(await recRes.json());
      if (catRes.ok && catRes.headers.get("content-type")?.includes("application/json")) setCategorias(await catRes.json());
      if (cartRes.ok && cartRes.headers.get("content-type")?.includes("application/json")) setCartoes(await cartRes.json());
      if (cfgRes.ok && cfgRes.headers.get("content-type")?.includes("application/json")) setConfig(await cfgRes.json());
    } catch (err) {
      console.error("Error loading financial data:", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, anoSel, mesSel, caixaSel]);

  // Helper to safely parse API responses without throwing JSON parse errors on HTML responses
  const safeFetchJson = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get("content-type") || "";
      let data: any = {};
      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch {
          data = { error: "Formato de resposta do servidor inválido." };
        }
      } else {
        const text = await res.text();
        data = { error: text || `Erro no servidor (${res.status})` };
      }
      return { ok: res.ok, status: res.status, data };
    } catch (err: any) {
      return { ok: false, status: 0, data: { error: err.message || "Erro de conexão com o servidor." } };
    }
  };

  // Handler functions with explicit success & error toast notifications
  const handleAddReceita = async (recData: Omit<Revenue, "id">) => {
    if (!recData.origem || !recData.origem.trim()) {
      addToast("error", "Não foi possível incluir a receita", "Por favor, preencha o campo Origem / Fonte da receita.");
      return;
    }
    if (!recData.valor || Number(recData.valor) <= 0) {
      addToast("error", "Não foi possível incluir a receita", "Por favor, informe um valor de receita válido maior que R$ 0,00.");
      return;
    }

    const { ok, data } = await safeFetchJson("/api/receitas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recData),
    });

    if (ok) {
      addToast(
        "success",
        "Receita incluída com sucesso!",
        `Origem: "${recData.origem}" - R$ ${Number(recData.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      );
      // Automatically align selected year/month/caixa so entry is instantly visible on Dashboard
      if (recData.data) {
        const parts = recData.data.split("-");
        if (parts.length >= 2) {
          const itemAno = parseInt(parts[0]);
          const itemMes = parseInt(parts[1]);
          if (itemAno && itemMes) {
            setAnoSel(itemAno);
            setMesSel(itemMes);
          }
        }
      }
      if (caixaSel !== "Consolidado" && recData.caixa && recData.caixa !== caixaSel) {
        setCaixaSel(recData.caixa as CaixaType);
      }
      loadAllData();
    } else {
      addToast(
        "error",
        "Não foi possível incluir a receita",
        data.error || data.message || "Por favor, verifique os dados informados."
      );
    }
  };

  const handleDeleteReceita = async (id: number) => {
    const { ok, data } = await safeFetchJson(`/api/receitas/${id}`, { method: "DELETE" });
    if (ok) {
      addToast("info", "Receita removida", "A entrada foi excluída do sistema.");
      loadAllData();
    } else {
      addToast("error", "Erro ao excluir receita", data.error || data.message || "Não foi possível remover a receita.");
    }
  };

  const handleAddDespesa = async (despData: any) => {
    if (!despData.descricao || !despData.descricao.trim()) {
      addToast("error", "Não foi possível incluir a despesa", "Por favor, preencha a descrição da despesa.");
      return;
    }
    if (!despData.valor || Number(despData.valor) <= 0) {
      addToast("error", "Não foi possível incluir a despesa", "Por favor, informe um valor de despesa válido maior que R$ 0,00.");
      return;
    }

    const { ok, data } = await safeFetchJson("/api/despesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(despData),
    });

    if (ok) {
      const numParcelas = parseInt(despData.total_parcelas) || 1;
      addToast(
        "success",
        "Despesa incluída com sucesso!",
        numParcelas > 1
          ? `"${despData.descricao}" em ${numParcelas}x de R$ ${(parseFloat(despData.valor) / numParcelas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
          : `"${despData.descricao}" - R$ ${Number(despData.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      );
      // Automatically align selected year/month/caixa based on competencia so it immediately shows in Dashboard
      const createdItem = Array.isArray(data) ? data[0] : data;
      if (createdItem && createdItem.data_competencia) {
        const parts = createdItem.data_competencia.split("-");
        if (parts.length >= 2) {
          const itemAno = parseInt(parts[0]);
          const itemMes = parseInt(parts[1]);
          if (itemAno && itemMes) {
            setAnoSel(itemAno);
            setMesSel(itemMes);
          }
        }
      }
      if (createdItem && caixaSel !== "Consolidado" && createdItem.caixa && createdItem.caixa !== caixaSel) {
        setCaixaSel(createdItem.caixa as CaixaType);
      }
      loadAllData();
    } else {
      addToast(
        "error",
        "Não foi possível incluir a despesa",
        data.error || data.message || "Verifique se preencheu data, descrição, categoria e valor."
      );
    }
  };

  const handleDeleteDespesa = async (id: number) => {
    const { ok, data } = await safeFetchJson(`/api/despesas/${id}`, { method: "DELETE" });
    if (ok) {
      addToast("info", "Despesa removida", "A despesa foi removida dos lançamentos.");
      loadAllData();
    } else {
      addToast("error", "Erro ao excluir despesa", data.error || data.message || "Falha ao excluir.");
    }
  };

  const handleAddDespesaFixa = async (fixaData: any) => {
    const { ok, data } = await safeFetchJson("/api/despesas-fixas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fixaData),
    });
    if (ok) {
      addToast(
        "success",
        "Despesa fixa incluída com sucesso!",
        `"${fixaData.descricao}" - Vencimento dia ${fixaData.dia_vencimento}`
      );
      loadAllData();
    } else {
      addToast(
        "error",
        "Inclusão de despesa fixa negada",
        data.error || data.message || "Descrição, categoria e valor são obrigatórios."
      );
    }
  };

  const handleToggleDespesaFixa = async (id: number) => {
    const { ok, data } = await safeFetchJson(`/api/despesas-fixas/${id}/toggle`, { method: "PATCH" });
    if (ok) {
      addToast("info", "Status alterado", "O status de renovação da despesa fixa foi atualizado.");
      loadAllData();
    } else {
      addToast("error", "Não foi possível alterar status", data.error || data.message);
    }
  };

  const handleDeleteDespesaFixa = async (id: number) => {
    const { ok, data } = await safeFetchJson(`/api/despesas-fixas/${id}`, { method: "DELETE" });
    if (ok) {
      addToast("info", "Despesa fixa removida", "A despesa fixa foi removida com sucesso.");
      loadAllData();
    } else {
      addToast("error", "Erro ao remover despesa fixa", data.error || data.message);
    }
  };

  const handleAddCategoria = async (catData: { nome: string; teto_mensal: number }) => {
    const { ok, data } = await safeFetchJson("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catData),
    });
    if (ok) {
      addToast("success", "Categoria incluída com sucesso!", `Nova categoria: "${catData.nome}"`);
      loadAllData();
    } else {
      addToast("error", "Inclusão de categoria negada", data.error || data.message || "Informe o nome da categoria.");
    }
  };

  const handleUpdateCategoriaTeto = async (id: number, teto: number) => {
    const { ok, data } = await safeFetchJson(`/api/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teto_mensal: teto }),
    });
    if (ok) {
      addToast("success", "Teto atualizado com sucesso!", `Novo teto definido para R$ ${Number(teto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
      loadAllData();
    } else {
      addToast("error", "Erro ao atualizar teto da categoria", data.error || data.message);
    }
  };

  const handleDeleteCategoria = async (id: number) => {
    const { ok, data } = await safeFetchJson(`/api/categorias/${id}`, { method: "DELETE" });
    if (ok) {
      addToast("info", "Categoria removida", "A categoria foi excluída.");
      loadAllData();
    } else {
      addToast("error", "Erro ao excluir categoria", data.error || data.message);
    }
  };

  const handleAddCartao = async (cartaoData: any) => {
    const { ok, data } = await safeFetchJson("/api/cartoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cartaoData),
    });
    if (ok) {
      addToast("success", "Cartão de crédito cadastrado!", `Cartão: "${cartaoData.nome}"`);
      loadAllData();
    } else {
      addToast("error", "Inclusão de cartão negada", data.error || data.message || "Nome e dias de fechamento/vencimento são obrigatórios.");
    }
  };

  const handleDeleteCartao = async (id: number) => {
    const { ok, data } = await safeFetchJson(`/api/cartoes/${id}`, { method: "DELETE" });
    if (ok) {
      addToast("info", "Cartão removido", "O cartão de crédito foi excluído.");
      loadAllData();
    } else {
      addToast("error", "Erro ao excluir cartão", data.error || data.message);
    }
  };

  const handleUpdateConfig = async (cfgData: Partial<AppConfig>) => {
    const { ok, data } = await safeFetchJson("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfgData),
    });
    if (ok) {
      addToast("success", "Configurações salvas com sucesso!");
      loadAllData();
    } else {
      addToast("error", "Falha ao salvar configurações", data.error || data.message);
    }
  };

  // 1. Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-2xl animate-pulse shadow-lg shadow-emerald-500/20">
          C
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-400 tracking-wide">
          Verificando credenciais e carregando ambiente seguro...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated state: Force user registration/login gate
  if (!user) {
    return <AuthScreen />;
  }

  // 3. Authenticated state: Render financial app
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        anoSel={anoSel}
        setAnoSel={setAnoSel}
        mesSel={mesSel}
        setMesSel={setMesSel}
        caixaSel={caixaSel}
        setCaixaSel={setCaixaSel}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto pb-20 md:pb-8">
          {activeTab === "dashboard" && (
            <Dashboard
              summary={summary}
              despesas={despesas}
              ano={anoSel}
              mes={mesSel}
              caixaSel={caixaSel}
              onRefresh={loadAllData}
              onDeleteDespesa={handleDeleteDespesa}
            />
          )}

          {activeTab === "receitas" && (
            <Revenues
              receitas={receitas}
              ano={anoSel}
              mes={mesSel}
              onAddReceita={handleAddReceita}
              onDeleteReceita={handleDeleteReceita}
            />
          )}

          {activeTab === "despesas" && (
            <Expenses
              despesas={despesas}
              despesasFixas={despesasFixas}
              categorias={categorias}
              cartoes={cartoes}
              ano={anoSel}
              mes={mesSel}
              onAddDespesa={handleAddDespesa}
              onDeleteDespesa={handleDeleteDespesa}
              onAddDespesaFixa={handleAddDespesaFixa}
              onToggleDespesaFixa={handleToggleDespesaFixa}
              onDeleteDespesaFixa={handleDeleteDespesaFixa}
              onAddCartao={handleAddCartao}
              onDeleteCartao={handleDeleteCartao}
            />
          )}

          {activeTab === "categorias" && (
            <Categories
              categorias={categorias}
              onAddCategoria={handleAddCategoria}
              onUpdateCategoriaTeto={handleUpdateCategoriaTeto}
              onDeleteCategoria={handleDeleteCategoria}
            />
          )}

          {activeTab === "relatorios" && (
            <Reports
              receitas={receitas}
              despesas={despesas}
              ano={anoSel}
              mes={mesSel}
            />
          )}

          {activeTab === "configuracoes" && (
            <Settings config={config} onUpdateConfig={handleUpdateConfig} />
          )}
        </main>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Global Toast Notifications banner overlay */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
