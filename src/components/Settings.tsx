import React, { useState, useEffect } from "react";
import { AppConfig } from "../types";
import { Settings as SettingsIcon, PiggyBank, Save } from "lucide-react";

interface SettingsProps {
  config: AppConfig | null;
  onUpdateConfig: (cfg: Partial<AppConfig>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, onUpdateConfig }) => {
  const [reservaPercent, setReservaPercent] = useState("15");
  const [fundoAcumulado, setFundoAcumulado] = useState("42500");
  const [fundoMeta, setFundoMeta] = useState("100000");

  useEffect(() => {
    if (config) {
      setReservaPercent(config.reserva_percentual.toString());
      setFundoAcumulado(config.fundo_emancipacao_acumulado.toString());
      setFundoMeta(config.fundo_emancipacao_meta.toString());
    }
  }, [config]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      reserva_percentual: parseFloat(reservaPercent) || 15,
      fundo_emancipacao_acumulado: parseFloat(fundoAcumulado) || 0,
      fundo_emancipacao_meta: parseFloat(fundoMeta) || 100000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-slate-400" />
            ⚙️ Configurações do Sistema
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ajuste parâmetros orçamentários e metas de investimento
          </p>
        </div>
      </div>

      {/* Financial Goals Form */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-emerald-400" />
          Metas Financeiras e Parâmetros do Sistema
        </h3>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Meta de Reserva Mensal (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={reservaPercent}
              onChange={(e) => setReservaPercent(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Porcentagem recomendada para aportes sobre a receita total.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Fundo Emancipação - Valor Atual (R$)
            </label>
            <input
              type="number"
              step="100"
              value={fundoAcumulado}
              onChange={(e) => setFundoAcumulado(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Fundo Emancipação - Meta Global (R$)
            </label>
            <input
              type="number"
              step="1000"
              value={fundoMeta}
              onChange={(e) => setFundoMeta(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-teal-400 font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
