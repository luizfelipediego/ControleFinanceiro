import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Tags,
  FileSpreadsheet,
  Settings,
  CreditCard,
  Building2,
} from "lucide-react";

export type NavTab = "dashboard" | "receitas" | "despesas" | "categorias" | "relatorios" | "configuracoes";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "receitas", label: "Receitas (Entradas)", icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
    { id: "despesas", label: "Despesas e Cartões", icon: <Receipt className="w-5 h-5 text-rose-500" /> },
    { id: "categorias", label: "Categorias e Tetos", icon: <Tags className="w-5 h-5 text-amber-500" /> },
    { id: "relatorios", label: "Relatórios e Exportação", icon: <FileSpreadsheet className="w-5 h-5 text-teal-500" /> },
    { id: "configuracoes", label: "Configurações", icon: <Settings className="w-5 h-5 text-slate-400" /> },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex md:flex-col justify-between shrink-0">
      <div className="space-y-1 w-full flex md:flex-col justify-around md:justify-start gap-1 overflow-x-auto md:overflow-visible">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="hidden md:block pt-6 border-t border-slate-800 mt-auto">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-xs text-slate-400">
          <div className="flex items-center gap-2 mb-1 text-slate-300 font-medium">
            <Building2 className="w-4 h-4 text-emerald-400" /> Gestão Financeira PJ e PF
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Isolamento de caixa ativo. Todas as transações são sincronizadas.
          </p>
        </div>
      </div>
    </aside>
  );
};
