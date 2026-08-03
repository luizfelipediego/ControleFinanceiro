import React from "react";
import { CaixaType } from "../types";
import { MESES_PT } from "../utils/formatters";
import { Wallet, Calendar, User, LogOut, ArrowRightLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  anoSel: number;
  setAnoSel: (ano: number) => void;
  mesSel: number;
  setMesSel: (mes: number) => void;
  caixaSel: CaixaType;
  setCaixaSel: (caixa: CaixaType) => void;
  onOpenAIModal?: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  anoSel,
  setAnoSel,
  mesSel,
  setMesSel,
  caixaSel,
  setCaixaSel,
  onOpenAuthModal,
}) => {
  const { user, logout } = useAuth();
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-slate-950 text-xl">
            C
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-2">
              Controle Financeiro <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">PRO</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Gestão de Finanças Pessoais e PJ</p>
          </div>
        </div>

        {/* Controls: Month/Year & Flow Filters */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center max-w-2xl">
          {/* Period Selector */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/80 text-sm">
            <Calendar className="w-4 h-4 text-emerald-400 ml-2 mr-1 hidden md:block" />
            <select
              value={mesSel}
              onChange={(e) => setMesSel(Number(e.target.value))}
              className="bg-transparent text-slate-200 font-medium text-xs sm:text-sm px-2 py-1 focus:outline-none cursor-pointer"
            >
              {Object.entries(MESES_PT).map(([mNum, mNome]) => (
                <option key={mNum} value={mNum} className="bg-slate-900 text-slate-200">
                  {mNome}
                </option>
              ))}
            </select>
            <span className="text-slate-600">/</span>
            <select
              value={anoSel}
              onChange={(e) => setAnoSel(Number(e.target.value))}
              className="bg-transparent text-slate-200 font-medium text-xs sm:text-sm px-2 py-1 focus:outline-none cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-slate-200">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Cashflow Caixa Toggle */}
          <div className="hidden lg:flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/80 text-xs">
            <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400 ml-2 mr-1" />
            {(["Consolidado", "PF (Pessoal)", "PJ (Empresa)"] as CaixaType[]).map((cx) => (
              <button
                key={cx}
                onClick={() => setCaixaSel(cx)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  caixaSel === cx
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cx}
              </button>
            ))}
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* User Auth Profile */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-2 text-left hover:bg-slate-800/80 p-1.5 rounded-xl transition-colors cursor-pointer"
                  title="Gerenciar Conta"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Avatar"}
                      className="w-8 h-8 rounded-full border border-emerald-500/50 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      {user.displayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="hidden xl:block text-xs text-left">
                    <p className="font-medium text-slate-200 leading-none truncate max-w-[120px]">
                      {user.displayName || user.email?.split("@")[0]}
                    </p>
                    <p className="text-emerald-400 text-[10px] font-semibold mt-0.5">Conectado (Gmail/Email)</p>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Entrar / Cadastrar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
