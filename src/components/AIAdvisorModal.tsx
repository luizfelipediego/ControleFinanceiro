import React, { useState, useEffect } from "react";
import { AIAdvisorResponse, CaixaType } from "../types";
import { useAuth } from "../context/AuthContext";
import { Sparkles, X, BrainCircuit, AlertTriangle, Lightbulb, Activity, RefreshCw, ShieldCheck } from "lucide-react";

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  ano: number;
  mes: number;
  caixaSel: CaixaType;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  ano,
  mes,
  caixaSel,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [advisorData, setAdvisorData] = useState<AIAdvisorResponse | null>(null);

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ano,
          mes,
          caixa: caixaSel,
          user_email: user?.email || "Visitante",
          user_name: user?.displayName || user?.email?.split("@")[0] || "Usuário",
        }),
      });
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        setAdvisorData(data);
      } else {
        setAdvisorData({
          insights: "Não foi possível carregar a análise do assistente neste momento.",
          alertas: ["Verifique sua conexão com o servidor."],
          sugestoes_economia: ["Tente novamente mais tarde."],
          saude_financeira_score: 70,
        });
      }
    } catch (err) {
      console.error("AI Advisor Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdvice();
    }
  }, [isOpen, ano, mes, caixaSel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">IA Consultor Financeiro (Gemini 3.6 Flash)</h3>
              <p className="text-xs text-slate-400">Análise inteligente de padrão de consumo e orçamentos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-300">Analisando entradas, cartões e tetos orçamentários...</p>
              <p className="text-xs text-slate-500">Avaliando conformidade do fluxo de caixa com Gemini AI</p>
            </div>
          ) : advisorData ? (
            <>
              {/* Financial Health Score */}
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Índice de Saúde Financeira</p>
                    <p className="text-lg font-bold text-white">Pontuação do Mês</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                  <span className="text-2xl font-black text-emerald-400">{advisorData.saude_financeira_score}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>

              {/* Insights Section */}
              <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4" /> Diagnóstico do Mês
                </h4>
                <p className="text-xs leading-relaxed text-slate-200">{advisorData.insights}</p>
              </div>

              {/* Warnings / Alerts */}
              {advisorData.alertas && advisorData.alertas.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Alertas de Estouro / Risco
                  </h4>
                  <ul className="space-y-1 text-xs text-rose-200 list-disc list-inside">
                    {advisorData.alertas.map((alt, idx) => (
                      <li key={idx}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {advisorData.sugestoes_economia && advisorData.sugestoes_economia.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" /> Recomendações Práticas de Economia
                  </h4>
                  <ul className="space-y-1 text-xs text-amber-200 list-disc list-inside">
                    {advisorData.sugestoes_economia.map((sug, idx) => (
                      <li key={idx}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              Não foi possível carregar a análise no momento.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-between items-center">
          <button
            onClick={fetchAdvice}
            disabled={loading}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar Análise
          </button>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
