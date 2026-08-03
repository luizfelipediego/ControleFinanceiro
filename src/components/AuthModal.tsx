import React, { useState } from "react";
import { useAuth, UserRole } from "../context/AuthContext";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  X,
  ShieldCheck,
  Smartphone,
  Cloud,
  CheckCircle2,
  Key,
  LogOut,
  Copy,
  Check,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail, updateUserRole, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySyncCode = () => {
    if (!user) return;
    navigator.clipboard.writeText(`CONTROLE_PRO_${user.uid.slice(0, 8)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Pop-up de login do Google foi fechado antes de concluir.");
      } else if (err.code === "auth/unauthorized-domain") {
        const currentDomain = window.location.hostname;
        setError(
          `O domínio atual (${currentDomain}) não está autorizado no Firebase Console para login com Google. Utilize o formulário de E-mail e Senha abaixo (criação imediata) ou adicione "${currentDomain}" no Firebase Console > Authentication > Settings > Authorized domains.`
        );
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
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* Logged In User Profile & Multi-Device Control */
          <div className="space-y-5">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Avatar"}
                  className="w-14 h-14 rounded-2xl border-2 border-emerald-500/50 object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl shrink-0">
                  {user.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white truncate">{user.displayName}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 shrink-0">
                    Nuvem Ativa
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">UID: {user.uid.slice(0, 16)}...</p>
              </div>
            </div>

            {/* Cloud Multi-Device Sync Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Cloud className="w-4 h-4" />
                  <span>Sincronização Multi-dispositivo</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Conectado
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Suas movimentações são salvas instantaneamente na nuvem Firebase e disponibilizadas em qualquer smartphone, tablet ou computador logado nesta conta.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-teal-400" /> Código de Pareamento Móvel:
                </span>
                <button
                  onClick={handleCopySyncCode}
                  className="font-mono text-emerald-300 font-bold bg-slate-900 border border-slate-700 hover:border-emerald-500/50 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copiado!" : `CONTROLE_PRO_${user.uid.slice(0, 6)}`}</span>
                </button>
              </div>
            </div>

            {/* Profile Role & Individual Permissions */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Nível de Perfil e Permissões
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { role: "admin" as UserRole, title: "Gestor (Admin)", desc: "Acesso total (Escrita & Configurações)" },
                  { role: "editor" as UserRole, title: "Colaborador", desc: "Pode incluir lançamentos e receitas" },
                  { role: "viewer" as UserRole, title: "Leitor", desc: "Apenas visualização de relatórios" },
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => updateUserRole(item.role)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      user.role === item.role
                        ? "bg-emerald-500/10 border-emerald-500 text-white font-bold"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200">{item.title}</span>
                      {user.role === item.role && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Permissões atuais: {user.roleLabel}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {user.role === "admin" && "Você pode cadastrar cartões, categorias, receitas, despesas e alterar parcelas."}
                  {user.role === "editor" && "Você pode registrar despesas e receitas. Modificação de categorias é restrita ao administrador."}
                  {user.role === "viewer" && "Modo de auditoria ativado. Formulários de criação estão desabilitados para visualização segura."}
                </p>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={logout}
                className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer min-h-[40px]"
              >
                <LogOut className="w-4 h-4" /> Desconectar Conta
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer min-h-[40px]"
              >
                Concluído
              </button>
            </div>
          </div>
        ) : (
          /* Unauthenticated Auth Form */
          <>
            {/* Modal Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {mode === "login" ? "Acessar Controle Financeiro" : "Criar Nova Conta"}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === "login"
                  ? "Entre com sua conta Google (Gmail) ou e-mail/senha"
                  : "Cadastre-se para sincronizar e proteger seus dados na nuvem"}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Login (Gmail) Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-3 transition-all transform active:scale-98 shadow-sm cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {/* SVG Google Logo */}
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
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">
                ou por E-mail
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmitEmail} className="space-y-3">
              {mode === "register" && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Nome de Exibição
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 min-h-[44px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50 mt-4 min-h-[44px]"
              >
                {mode === "login" ? (
                  <>
                    <LogIn className="w-4 h-4" /> Entrar com E-mail
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Finalizar Cadastro
                  </>
                )}
              </button>
            </form>

            {/* Switch Mode Footer */}
            <div className="text-center pt-2 border-t border-slate-800/80">
              {mode === "login" ? (
                <p className="text-xs text-slate-400">
                  Ainda não possui uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    Cadastre-se aqui
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Já possui uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    Fazer login
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

