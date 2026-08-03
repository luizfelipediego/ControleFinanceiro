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

      if (dashRes.ok) setSummary(await dashRes.json());
      if (despRes.ok) setDespesas(await despRes.json());
      if (fixasRes.ok) setDespesasFixas(await fixasRes.json());
      if (recRes.ok) setReceitas(await recRes.json());
      if (catRes.ok) setCategorias(await catRes.json());
      if (cartRes.ok) setCartoes(await cartRes.json());
      if (cfgRes.ok) setConfig(await cfgRes.json());
    } catch (err) {
      console.error("Error loading financial data:", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, anoSel, mesSel, caixaSel]);

  // Handler functions with explicit success & error toast notifications
  const handleAddReceita = async (recData: Omit<Revenue, "id">) => {
    try {
      const res = await fetch("/api/receitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recData),
      });
      const data = await res.json();
      if (res.ok) {
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
          "Inclusão de receita negada / com erro",
          data.error || data.message || "Por favor, verifique se os campos de origem, data e valor foram preenchidos corretamente."
        );
      }
    } catch (err: any) {
      addToast("error", "Não foi possível incluir a receita", err.message || "Erro de conexão com o servidor.");
    }
  };

  const handleDeleteReceita = async (id: number) => {
    try {
      const res = await fetch(`/api/receitas/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        addToast("info", "Receita removida", "A entrada foi excluída do sistema.");
        loadAllData();
      } else {
        addToast("error", "Erro ao excluir receita", data.error || data.message || "Não foi possível remover a receita.");
      }
    } catch (err: any) {
      addToast("error", "Erro de conexão", err.message);
    }
  };

  const handleAddDespesa = async (despData: any) => {
    try {
      const res = await fetch("/api/despesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(despData),
      });
      const data = await res.json();
      if (res.ok) {
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
          "Inclusão de despesa negada / com erro",
          data.error || data.message || "Verifique se preencheu data, descrição, categoria e valor."
        );
      }
    } catch (err: any) {
      addToast("error", "Não foi possível incluir a despesa", err.message || "Erro ao conectar com o servidor.");
    }
  };

  const handleDeleteDespesa = async (id: number) => {
    try {
      const res = await fetch(`/api/despesas/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        addToast("info", "Despesa removida", "A despesa foi removida dos lançamentos.");
        loadAllData();
      } else {
        addToast("error", "Erro ao excluir despesa", data.error || data.message || "Falha ao excluir.");
      }
    } catch (err: any) {
      addToast("error", "Erro de conexão", err.message);
    }
  };

  const handleAddDespesaFixa = async (fixaData: any) => {
    try {
      const res = await fetch("/api/despesas-fixas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fixaData),
      });
      const data = await res.json();
      if (res.ok) {
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
    } catch (err: any) {
      addToast("error", "Erro de conexão", err.message);
    }
  };

  const handleToggleDespesaFixa = async (id: number) => {
    try {
      const res = await fetch(`/api/despesas-fixas/${id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        addToast("info", "Status alterado", "O status de renovação da despesa fixa foi atualizado.");
        loadAllData();
      } else {
        addToast("error", "Não foi possível alterar status", data.error || data.message);
      }
    } catch (err: any) {
      addToast("error", "Erro de conexão", err.message);
    }
  };

  const handleDeleteDespesaFixa = async (id: number) => {
    try {
      const res = await fetch(`/api/despesas-fixas/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        addToast("info", "Despesa fixa removida", "A despesa fixa foi removida com sucesso.");
        loadAllData();
      } else {
        addToast("error", "Erro ao remover despesa fixa", data.error || data.message);
      }
    } catch (err: any) {
      addToast("error", "Erro de conexão", err.message);
    }
  };

  const handleAddCategoria = async (catData: { nome: string; teto_mensal: number }) => {
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catData),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("success", "Categoria incluída com sucesso!", `Nova categoria: "${catData.nome}"`);
        loadAllData();
      } else {
        addToast("error", "Inclusão de categoria negada", data.error || data.message || "Informe o nome da categoria.");
      }
    } catch (err: any) {
      addToast("error", "Erro de conexão", err.message);
    }
  };

  const handleUpdateCategoriaTeto = async (id: number, teto: number) => {
    try {
      const res = await fetch(`/api/categorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teto_mensal: teto }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("success", "Teto atualizado com sucesso!", `Novo teto definido para R$ ${Number(teto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
        loadAllData();
      } else {
        addToast("error", "Erro ao atualizar teto da categoria", data.error || data.message);
      }
    } catch (err: any) {
      addToast("error", "Erro de conexão", err.message);
    }
  };

  const handleDeleteCategoria = async (id: number) => {
    try {
      const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        addToast("info", "Categoria removida", "A categoria foi excluída.");
        loadAllData();
      } else {
        addToast("error", "Erro ao excluir categoria", data.error || data.message);
      }
    } catch (err: any) {
      addToast("error", "Erro de conexão", err.message);
    }
  };

  const handleAddCartao = async (cartaoData: any) => {
    try {
      const res = await fetch("/api/cartoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartaoData),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("success", "Cartão de crédito cadastrado!", `Cartão: "${cartaoData.nome}"`);
        loadAllData();
      } else {
        addToast("error", "Inclusão de cartão negada", data.error || data.message || "Nome e dias de fechamento/vencimento são obrigatórios.");
      }
    } catch (err: any) {
      addToast("error", "Erro de conexão", err.message);
    }
  };

  const handleDeleteCartao = async (id: number) => {
    try {
      const res = await fetch(`/api/cartoes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        addToast("info", "Cartão removido", "O cartão de crédito foi excluído.");
        loadAllData();
      } else {
        addToast("error", "Erro ao excluir cartão", data.error || data.message);
      }
    } catch (err: any) {
      addToast("error", "Erro de conexão", err.message);
    }
  };

  const handleUpdateConfig = async (cfgData: Partial<AppConfig>) => {
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfgData),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("success", "Configurações salvas com sucesso!");
        loadAllData();
      } else {
        addToast("error", "Falha ao salvar configurações", data.error || data.message);
      }
    } catch (err: any) {
      addToast("error", "Erro de conexão", err.message);
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
