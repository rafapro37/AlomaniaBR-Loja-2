import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useLogo } from "@/contexts/LogoContext";
import { useLocation } from "wouter";
import { AlertCircle, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, users } = useUser();
  const { logoUrl } = useLogo();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simular delay de requisição
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!email.trim() || !password.trim()) {
      setError("Preencha todos os campos");
      setLoading(false);
      return;
    }

    console.log("Usuários disponíveis:", users);
    console.log("Tentando login com:", { email: email.trim(), password: password.trim() });
    
    if (login(email, password)) {
      setLocation("/");
    } else {
      setError("Usuário ou senha inválidos");
      console.error("Login falhou para:", email);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-300 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300 opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
            <img
              src={logoUrl}
              alt="Logo Alomania BR"
              className="w-20 h-20 rounded-lg mx-auto mb-4 object-contain shadow-md"
            />
            <h1 className="text-3xl font-bold text-white mb-1">Alomania BR</h1>
            <p className="text-blue-100 text-sm font-medium">Painel Gerenciador</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-600 uppercase tracking-wide text-slate-700 mb-2">
                  Usuário
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-400"
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-600 uppercase tracking-wide text-slate-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-400"
                  disabled={loading}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit(e as any)}
                  autoComplete="off"
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-2.5 rounded-md hover:from-amber-600 hover:to-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
            <p className="text-xs text-slate-600 text-center font-medium">
              © 2026 Alomania BR. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
