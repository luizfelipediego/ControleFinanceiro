import React, { useState, useMemo } from "react";
import { formatarMoeda } from "../utils/formatters";
import { Award, Calculator, TrendingUp, Sparkles, DollarSign, Calendar, RefreshCw } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface EmancipationSimulatorProps {
  saldoAtualInicial?: number;
  metaInicial?: number;
}

export const EmancipationSimulator: React.FC<EmancipationSimulatorProps> = ({
  saldoAtualInicial = 42500,
  metaInicial = 100000,
}) => {
  const [saldoInicial, setSaldoInicial] = useState<number>(saldoAtualInicial);
  const [aporteMensal, setAporteMensal] = useState<number>(1000);
  const [taxaAnual, setTaxaAnual] = useState<number>(10.5); // % a.a.
  const [metaFinal, setMetaFinal] = useState<number>(metaInicial);
  const [anosHorizonte, setAnosHorizonte] = useState<number>(10);

  // Calculate monthly compounding simulation
  const simulation = useMemo(() => {
    const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
    let patrimonio = saldoInicial;
    let totalInvestido = saldoInicial;
    let totalJuros = 0;
    let mesMetaAtingida: number | null = null;

    const dataPoints: {
      mes: number;
      label: string;
      patrimonio: number;
      investido: number;
      juros: number;
    }[] = [];

    const totalMeses = anosHorizonte * 12;

    for (let m = 0; m <= totalMeses; m++) {
      if (m === 0) {
        dataPoints.push({
          mes: 0,
          label: "Início",
          patrimonio: Math.round(patrimonio),
          investido: Math.round(totalInvestido),
          juros: 0,
        });
      } else {
        const rendimentoMes = patrimonio * taxaMensal;
        totalJuros += rendimentoMes;
        patrimonio += rendimentoMes + aporteMensal;
        totalInvestido += aporteMensal;

        if (mesMetaAtingida === null && patrimonio >= metaFinal) {
          mesMetaAtingida = m;
        }

        // Add to chart at 6-month intervals or key dates
        if (m % 6 === 0 || m === totalMeses || (mesMetaAtingida === m)) {
          const anosNoPonto = Math.floor(m / 12);
          const mesesNoPonto = m % 12;
          const labelPonto =
            anosNoPonto > 0
              ? `${anosNoPonto}a ${mesesNoPonto > 0 ? mesesNoPonto + 'm' : ''}`
              : `${mesesNoPonto}m`;

          dataPoints.push({
            mes: m,
            label: labelPonto,
            patrimonio: Math.round(patrimonio),
            investido: Math.round(totalInvestido),
            juros: Math.round(totalJuros),
          });
        }
      }
    }

    const anosMeta = mesMetaAtingida ? Math.floor(mesMetaAtingida / 12) : null;
    const mesesRestantesMeta = mesMetaAtingida ? mesMetaAtingida % 12 : null;

    return {
      patrimonioFinal: patrimonio,
      totalInvestido,
      totalJuros,
      mesMetaAtingida,
      anosMeta,
      mesesRestantesMeta,
      dataPoints,
    };
  }, [saldoInicial, aporteMensal, taxaAnual, metaFinal, anosHorizonte]);

  const aplicarPreset = (preset: "conservador" | "moderado" | "agressivo" | "longo") => {
    if (preset === "conservador") {
      setTaxaAnual(8.5);
      setAporteMensal(800);
    } else if (preset === "moderado") {
      setTaxaAnual(11.0);
      setAporteMensal(1200);
    } else if (preset === "agressivo") {
      setTaxaAnual(14.0);
      setAporteMensal(1500);
    } else if (preset === "longo") {
      setTaxaAnual(10.5);
      setAporteMensal(600);
      setAnosHorizonte(18);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              🎯 Simulador de Juros Compostos e Projeção do Fundo
            </h3>
            <p className="text-xs text-slate-400">
              Projete a velocidade de crescimento do patrimônio e tempo estimado para atingir a emancipação
            </p>
          </div>
        </div>

        {/* Preset Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-[11px] font-medium mr-1">Presets:</span>
          <button
            onClick={() => aplicarPreset("conservador")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            🛡️ Conservador (8.5%)
          </button>
          <button
            onClick={() => aplicarPreset("moderado")}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium transition-colors"
          >
            ⚡ Moderado (11.0%)
          </button>
          <button
            onClick={() => aplicarPreset("agressivo")}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-medium transition-colors"
          >
            🔥 Agressivo (14.0%)
          </button>
        </div>
      </div>

      {/* Control Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
        {/* Saldo Inicial */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Saldo Atual (R$)
          </label>
          <input
            type="number"
            value={saldoInicial}
            onChange={(e) => setSaldoInicial(Number(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Aporte Mensal */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Aporte Recorrente (R$/mês)
          </label>
          <input
            type="number"
            step="50"
            value={aporteMensal}
            onChange={(e) => setAporteMensal(Number(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Taxa de Rendimento Anual */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Rentabilidade (% a.a.)
          </label>
          <input
            type="number"
            step="0.5"
            value={taxaAnual}
            onChange={(e) => setTaxaAnual(Number(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-teal-400 font-bold focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Meta Desejada */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Meta Final (R$)
          </label>
          <input
            type="number"
            step="1000"
            value={metaFinal}
            onChange={(e) => setMetaFinal(Number(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Horizonte em Anos */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Prazo Simulado ({anosHorizonte} Anos)
          </label>
          <input
            type="range"
            min="1"
            max="25"
            value={anosHorizonte}
            onChange={(e) => setAnosHorizonte(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer mt-2"
          />
        </div>
      </div>

      {/* Target Timeline Highlight Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/30 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-400 font-medium">Previsão para a Meta de {formatarMoeda(metaFinal)}:</p>
            {simulation.mesMetaAtingida ? (
              <p className="text-lg font-bold text-white mt-0.5">
                Meta atingida em <span className="text-emerald-400">{simulation.anosMeta} anos e {simulation.mesesRestantesMeta} meses</span> ({simulation.mesMetaAtingida} meses)!
              </p>
            ) : (
              <p className="text-sm font-semibold text-amber-300 mt-0.5">
                Para atingir a meta no prazo de {anosHorizonte} anos, considere aumentar o aporte mensal ou a rentabilidade.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Patrimônio em {anosHorizonte} anos</span>
            <span className="font-bold text-emerald-400 text-sm">{formatarMoeda(simulation.patrimonioFinal)}</span>
          </div>
          <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Juros Ganhos (Efeito Bola de Neve)</span>
            <span className="font-bold text-teal-300 text-sm">{formatarMoeda(simulation.totalJuros)}</span>
          </div>
        </div>
      </div>

      {/* Interactive Growth Area Chart */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Curva de Crescimento: Total Investido vs Patrimônio com Juros
        </h4>
        <div className="h-64 w-full bg-slate-950/40 p-3 rounded-xl border border-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simulation.dataPoints}>
              <defs>
                <linearGradient id="gradPatrimonio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradInvestido" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
              <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
              <Area
                type="monotone"
                dataKey="patrimonio"
                name="Patrimônio Total (com Juros)"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#gradPatrimonio)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="investido"
                name="Total Aportado"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#gradInvestido)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
