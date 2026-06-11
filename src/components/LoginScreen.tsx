import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { hashPassword } from "../utils/security";

interface LoginScreenProps {
  storedHash: string;
  onLoginSuccess: (password: string) => void;
  palette: any;
}

export default function LoginScreen({ storedHash, onLoginSuccess, palette }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) return;

    setIsSubmitting(true);
    setError("");

    try {
      const inputHash = await hashPassword(password);
      if (inputHash === storedHash) {
        onLoginSuccess(password);
      } else {
        setError("Hatalı Giriş Şifresi! Lütfen tekrar deneyin.");
        setPassword("");
      }
    } catch (err) {
      setError("Şifre doğrulanırken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickKey = (num: string) => {
    setError("");
    if (password.length < 10) {
      setPassword(prev => prev + num);
    }
  };

  const handleClear = () => {
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/60 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-full mb-3">
            <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Akıllı Bütçe Takip
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center">
            Verileriniz uçtan uca şifrelenmektedir.<br/>Giriş yapmak için şifrenizi girin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre (Varsayılan: 1234)"
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg font-sans tracking-widest placeholder:text-sm placeholder:tracking-normal placeholder:font-sans transition"
              disabled={isSubmitting}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-red-500 dark:text-red-400 text-center text-xs font-semibold animate-shake">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !password}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        {/* Quick PIN Pad for easy mobile clicking */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-wider font-semibold">
            Hızlı Giriş Paneli
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleQuickKey(num)}
                className="py-3 bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700/85 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:shadow-sm font-mono text-lg transition-all"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 bg-red-50 active:bg-red-100 dark:bg-red-950/20 dark:active:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium text-xs transition"
            >
              Temizle
            </button>
            <button
              type="button"
              onClick={() => handleQuickKey("0")}
              className="py-3 bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700/85 text-slate-700 dark:text-slate-300 rounded-xl font-semibold font-mono text-lg transition"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!password}
              className="py-3 bg-emerald-100 active:bg-emerald-200 dark:bg-emerald-950/30 dark:active:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-xs transition"
            >
              Onayla
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Şifre çözme anahtarı asla sunucuya yollanmaz.</span>
        </div>
      </div>
    </div>
  );
}
