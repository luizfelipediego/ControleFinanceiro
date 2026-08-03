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

  // Handler functions
  const handleAddReceita = async (recData: Omit<Revenue, "id">) => {
    await fetch("/api/receitas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recData),
    });
    loadAllData();
  };

  const handleDeleteReceita = async (id: number) => {
    await fetch(`/api/receitas/${id}`, { method: "DELETE" });
    loadAllData();
  };

  const handleAddDespesa = async (despData: any) => {
    await fetch("/api/despesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(despData),
    });
    loadAllData();
  };

  const handleDeleteDespesa = async (id: number) => {
    await fetch(`/api/despesas/${id}`, { method: "DELETE" });
    loadAllData();
  };

  const handleAddDespesaFixa = async (fixaData: any) => {
    await fetch("/api/despesas-fixas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fixaData),
    });
    loadAllData();
  };

  const handleToggleDespesaFixa = async (id: number) => {
    await fetch(`/api/despesas-fixas/${id}/toggle`, { method: "PATCH" });
    loadAllData();
  };

  const handleDeleteDespesaFixa = async (id: number) => {
    await fetch(`/api/despesas-fixas/${id}`, { method: "DELETE" });
    loadAllData();
  };

  const handleAddCategoria = async (catData: { nome: string; teto_mensal: number }) => {
    await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catData),
    });
    loadAllData();
  };

  const handleUpdateCategoriaTeto = async (id: number, teto: number) => {
    await fetch(`/api/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teto_mensal: teto }),
    });
    loadAllData();
  };

  const handleDeleteCategoria = async (id: number) => {
    await fetch(`/api/categorias/${id}`, { method: "DELETE" });
    loadAllData();
  };

  const handleAddCartao = async (cartaoData: any) => {
    await fetch("/api/cartoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cartaoData),
    });
    loadAllData();
  };

  const handleDeleteCartao = async (id: number) => {
    await fetch(`/api/cartoes/${id}`, { method: "DELETE" });
    loadAllData();
  };

  const handleUpdateConfig = async (cfgData: Partial<AppConfig>) => {
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfgData),
    });
    loadAllData();
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
