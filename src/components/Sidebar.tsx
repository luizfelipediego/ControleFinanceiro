import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Tags,
  FileSpreadsheet,
  Settings,
  Building2,
} from "lucide-react";

export type NavTab = "dashboard" | "receitas" | "despesas" | "categorias" | "relatorios" | "configuracoes";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems: { id: NavTab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", shortLabel: "Início", icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { id: "receitas", label: "Receitas (Entradas)", shortLabel: "Receitas", icon: <TrendingUp className="w-5 h-5 shrink-0 text-emerald-400" /> },
    { id: "despesas", label: "Despesas e Cartões", shortLabel: "Despesas", icon: <Receipt className="w-5 h-5 shrink-0 text-rose-400" /> },
    { id: "categorias", label: "Categorias e Tetos", shortLabel: "Categorias", icon: <Tags className="w-5 h-5 shrink-0 text-amber-400" /> },
    { id: "relatorios", label: "Relatórios e Exportação", shortLabel: "Relatórios", icon: <FileSpreadsheet className="w-5 h-5 shrink-0 text-teal-400" /> },
    { id: "configuracoes", label: "Configurações", shortLabel: "Ajustes", icon: <Settings className="w-5 h-5 shrink-0 text-slate-400" /> },
  ];

  return (
    <>
      {/* Desktop Sidebar (Left side, md screens and up) */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 p-4 flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
        <div className="space-y-1.5 w-full">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Navegação Principal</p>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-6 border-t border-slate-800 mt-auto">
          <div className="bg-slate-850 rounded-2xl p-3.5 border border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2 mb-1 text-slate-200 font-semibold">
              <Building2 className="w-4 h-4 text-emerald-400" /> Gestão PF e PJ Ativa
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Alternância de caixa sincronizada em tempo real.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Top/Horizontal Scrollable Tab Bar (visible on screens < md) */}
      <nav className="flex md:hidden bg-slate-900 border-b border-slate-800 p-2 overflow-x-auto no-scrollbar shrink-0 sticky top-16 z-20 shadow-md">
        <div className="flex items-center gap-2 min-w-full px-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[44px] shrink-0 ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                }`}
              >
                {item.icon}
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
