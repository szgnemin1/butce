import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { hashPassword } from "../utils/security";

interface LoginScreenProps {
  storedHash: string;
  onLoginSuccess: (password: string) => void;
  palette: any;
  onResetDatabase: () => Promise<void>;
}

export default function LoginScreen({ storedHash, onLoginSuccess, palette, onResetDatabase }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  const handleResetClick = async () => {
    const isConfirmed = window.confirm(
      "Dikkat! Bu işlem tarayıcıdaki yerel verileri ve sunucuya (VDS) yedeklenmiş olan şifreli verilerinizi tamamen silecektir.\n\nSıfırlama başarılı olduktan sonra yeni şifreniz '1234' olarak tanımlanacaktır. Devam etmek istiyor musunuz?"
    );
    if (!isConfirmed) return;

    setIsResetting(true);
    try {
      await onResetDatabase();
      setPassword("");
      setError("");
    } catch (err) {
      alert("Sıfırlama işlemi başarısız oldu.");
    } finally {
      setIsResetting(false);
    }
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

        {/* Troubleshooting/Reset Section */}
        <div className="mt-6 pt-4 border-t border-slate-150 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <span>Giriş Sorunları ve Şifre Sıfırlama</span>
            {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showHelp && (
            <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tarayıcı önbelleğinizde veya sunucunuzda, eski sürümlerden kalma ve <span className="font-mono font-bold bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">test</span> şifresiyle şifrelenmiş veriler bulunuyor olabilir. Eskiden şifrelenen veriler yanlış PIN hatası verir.
                </p>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-6 space-y-1.5">
                <p>💡 <span className="font-semibold">Çözüm 1:</span> Giriş alanına <span className="font-mono font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200">test</span> yazarak girmeyi deneyin.</p>
                <p>🛠️ <span className="font-semibold">Çözüm 2:</span> Verileri tamamen temizleyip yeni şifrenizi <span className="font-semibold text-emerald-600 dark:text-emerald-400">1234</span> yapmak için aşağıdaki sıfırlama butonunu kullanın.</p>
              </div>

              <button
                type="button"
                onClick={handleResetClick}
                disabled={isResetting}
                className="w-full mt-1.5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
                {isResetting ? "Sistem Sıfırlanıyor..." : "Verileri Sıfırla ve Girişi 1234 Yap"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Şifre çözme anahtarı asla sunucuya yollanmaz.</span>
        </div>
      </div>
    </div>
  );
}
