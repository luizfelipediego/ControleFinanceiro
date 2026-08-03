import React from "react";
import { CaixaType } from "../types";
import { MESES_PT } from "../utils/formatters";
import { Calendar, User, LogOut, ArrowRightLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  anoSel: number;
  setAnoSel: (ano: number) => void;
  mesSel: number;
  setMesSel: (mes: number) => void;
  caixaSel: CaixaType;
  setCaixaSel: (caixa: CaixaType) => void;
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-slate-950 text-lg sm:text-xl shrink-0">
            C
          </div>
          <div className="hidden min-[380px]:block">
            <h1 className="font-bold text-sm sm:text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
              Controle <span className="hidden sm:inline">Financeiro</span> <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">PRO</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 hidden md:block">Gestão de Finanças Pessoais e PJ</p>
          </div>
        </div>

        {/* Period Selector & Caixa Selector */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-1 justify-center max-w-2xl">
          {/* Period Selector */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/80 text-xs sm:text-sm">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 ml-1.5 mr-0.5 hidden sm:block" />
            <select
              value={mesSel}
              onChange={(e) => setMesSel(Number(e.target.value))}
              className="bg-transparent text-slate-100 font-semibold text-xs sm:text-sm px-1.5 sm:px-2 py-1 focus:outline-none cursor-pointer"
            >
              {Object.entries(MESES_PT).map(([mNum, mNome]) => (
                <option key={mNum} value={mNum} className="bg-slate-900 text-slate-200">
                  {mNome}
                </option>
              ))}
            </select>
            <span className="text-slate-600 font-bold">/</span>
            <select
              value={anoSel}
              onChange={(e) => setAnoSel(Number(e.target.value))}
              className="bg-transparent text-slate-100 font-semibold text-xs sm:text-sm px-1.5 sm:px-2 py-1 focus:outline-none cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-slate-200">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Cashflow Caixa Toggle (Mobile dropdown + Desktop pills) */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/80 text-xs">
            <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400 ml-1.5 mr-1 shrink-0" />
            {/* Desktop pills */}
            <div className="hidden md:flex items-center gap-0.5">
              {(["Consolidado", "PF (Pessoal)", "PJ (Empresa)"] as CaixaType[]).map((cx) => (
                <button
                  key={cx}
                  onClick={() => setCaixaSel(cx)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    caixaSel === cx
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cx}
                </button>
              ))}
            </div>

            {/* Mobile select dropdown */}
            <select
              value={caixaSel}
              onChange={(e) => setCaixaSel(e.target.value as CaixaType)}
              className="md:hidden bg-transparent text-emerald-400 font-bold text-xs px-1 py-1 focus:outline-none cursor-pointer"
            >
              <option value="Consolidado" className="bg-slate-900 text-slate-200">Consolidado</option>
              <option value="PF (Pessoal)" className="bg-slate-900 text-slate-200">PF (Pessoal)</option>
              <option value="PJ (Empresa)" className="bg-slate-900 text-slate-200">PJ (Empresa)</option>
            </select>
          </div>
        </div>

        {/* User Account Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 text-left hover:bg-slate-800/80 p-1.5 rounded-xl transition-colors cursor-pointer border border-slate-700/60 bg-slate-800/40"
                title="Minha Conta & Permissões"
              >
                <div className="relative shrink-0">
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
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
                </div>
                <div className="hidden lg:block text-xs text-left">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-slate-200 leading-none truncate max-w-[110px]">
                      {user.displayName || user.email?.split("@")[0]}
                    </p>
                  </div>
                  <p className="text-emerald-400 text-[10px] font-bold mt-0.5 flex items-center gap-1">
                    <span>{user.roleLabel || "Gestor"}</span>
                  </p>
                </div>
              </button>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer min-h-[40px]"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Entrar / Cadastrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
