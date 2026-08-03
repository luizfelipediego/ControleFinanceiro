import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, AlertCircle, ShieldCheck, CheckCircle, TrendingUp, CreditCard, Building2 } from "lucide-react";

export const AuthScreen: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Pop-up de login do Google foi fechado.");
      } else {
        setError(err.message || "Erro ao autenticar com o Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
    } catch (err: any) {
      console.error(err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("E-mail ou senha incorretos.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está cadastrado.");
      } else {
        setError(err.message || "Erro ao processar autenticação.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/30 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 my-auto">
        {/* Left Side: Brand & Feature Value Proposition */}
        <div className="flex flex-col justify-between space-y-6 md:border-r md:border-slate-800/80 md:pr-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-slate-950 text-2xl">
                C
              </div>
              <div>
                <h1 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
                  Controle Financeiro <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">PRO</span>
                </h1>
                <p className="text-xs text-slate-400">Gestão Inteligente de Finanças PF & PJ</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Para acessar o aplicativo e gerenciar seus lançamentos com segurança, faça login ou crie sua conta gratuita.
            </p>
          </div>

          <div className="space-y-3 py-2">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Separação PF e PJ</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Controle fluxo pessoal e empresarial de forma isolada e organizada.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Cartões e Parcelamentos</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Acompanhamento detalhado de parcelas de cartão e financiamentos.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Acesso Restrito e Seguro</h4>
                <p className="text-[11px] text-slate-400 leading-snug">Sincronização em tempo real para usuários cadastrados.</p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Cadastre-se para começar a usar em qualquer dispositivo.</span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="flex flex-col justify-center space-y-5">
          {/* Form Header */}
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {mode === "login" ? "Entrar na sua Conta" : "Criar Nova Conta"}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === "login"
                ? "Informe suas credenciais ou entre com Google"
                : "Preencha seus dados para criar seu cadastro"}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 hover:border-slate-600 font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-3 transition-all transform active:scale-98 shadow-sm cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Continuar com Google (Gmail)</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">
              ou por E-mail
            </span>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmitEmail} className="space-y-3">
            {mode === "register" && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Nome Completo / Exibição
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 min-h-[44px]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Endereço de E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 min-h-[44px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50 mt-4 min-h-[44px]"
            >
              {mode === "login" ? (
                <>
                  <LogIn className="w-4 h-4" /> Fazer Login
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Cadastrar e Acessar
                </>
              )}
            </button>
          </form>

          {/* Mode Switch Toggle */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            {mode === "login" ? (
              <p className="text-xs text-slate-400">
                Ainda não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className="text-emerald-400 font-bold hover:underline ml-1 cursor-pointer"
                >
                  Cadastre-se agora
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Já possui cadastro?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="text-emerald-400 font-bold hover:underline ml-1 cursor-pointer"
                >
                  Faça login aqui
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
