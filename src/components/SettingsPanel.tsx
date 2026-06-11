import React, { useState, useRef } from "react";
import { THEME_PALETTES, CATEGORIES } from "../utils/mockData";
import { hashPassword } from "../utils/security";
import { RefreshCw, Download, Upload, ShieldAlert, Key, CheckCircle, Smartphone, Sparkles, Eye, EyeOff } from "lucide-react";

interface SettingsPanelProps {
  currentTheme: 'zinc' | 'blue' | 'emerald' | 'amber' | 'violet' | 'rose';
  isDark: boolean;
  storedHash: string;
  lastBackupDate: string | null;
  geminiApiKey?: string;
  onThemeChange: (color: 'zinc' | 'blue' | 'emerald' | 'amber' | 'violet' | 'rose') => void;
  onDarkToggle: (val: boolean) => void;
  onPasswordChange: (newHash: string, newPw?: string) => void;
  onCloudSync: () => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onGeminiApiKeyChange: (key: string) => void;
  palette: any;
}

export default function SettingsPanel({
  currentTheme,
  isDark,
  storedHash,
  lastBackupDate,
  geminiApiKey = "",
  onThemeChange,
  onDarkToggle,
  onPasswordChange,
  onCloudSync,
  onExportBackup,
  onImportBackup,
  onGeminiApiKeyChange,
  palette
}: SettingsPanelProps) {
  // Password change Form states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Gemini API Key config local state
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [apiKeySuccess, setApiKeySuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError("Tüm şifre alanlarını doldurun.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Yeni şifreler eşleşmiyor.");
      return;
    }

    try {
      const oldHash = await hashPassword(oldPassword);
      if (oldHash !== storedHash) {
        setPwError("Eski şifre hatalı.");
        return;
      }

      const newHash = await hashPassword(newPassword);
      onPasswordChange(newHash, newPassword);
      setPwSuccess("Giriş şifreniz başarıyla güncellendi.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError("Şifre güncellenirken hata oluştu.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportBackup(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Customize Theme Options */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">Görünüm ve Özelleştirilebilir Temalar</h3>
        
        <div className="space-y-6">
          {/* Active styling selecter */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-3 block">Renk Teması Seçimi</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Object.keys(THEME_PALETTES).map(key => {
                const isSelected = currentTheme === key;
                const p = (THEME_PALETTES as any)[key];
                
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onThemeChange(key as any)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase tracking-tight shadow-sm select-none border-2 cursor-pointer transition flex items-center justify-center gap-1.5 ${
                      isSelected 
                        ? `${p.primary} border-slate-800 dark:border-white scale-[1.03]` 
                        : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border-transparent text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-current" />
                    {key === "emerald" ? "Zümrüt" : key === "blue" ? "Mavi" : key === "zinc" ? "Gri" : key === "amber" ? "Kehribar" : key === "violet" ? "Mor" : "Gül"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dark Toggle Mode */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Karanlık Mod Desteği</p>
              <p className="text-xs text-slate-400">Göz yorulmalarını en aza indiren gece teması.</p>
            </div>
            <button
              type="button"
              onClick={() => onDarkToggle(!isDark)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDark ? "bg-emerald-500" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDark ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Database sync and backup options */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">Veritabanı Yedeklemesi & Senkronizasyon</h3>
        <p className="text-slate-400 text-xs mb-6">
          Verileriniz uçtan uca şifrelenir. Şifre çözme anahtarı asla dışarı sızdırılmaz. Yedeklerinizi güvenle saklayabilirsiniz.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cloud sync backup */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1">
                Bulut Yedekleme
              </h4>
              <p className="text-[10px] text-slate-400">Verileri şifreleyerek VDS bulut sunucusunda güvenle sunucuyla eşitler.</p>
              <p className="text-[9px] text-slate-500">
                Son Senkronizasyon: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{lastBackupDate ? new Date(lastBackupDate).toLocaleTimeString() : "Hiç Yapılmadı"}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onCloudSync}
              className={`w-full mt-4 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-200 cursor-pointer shadow-sm transition`}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Bulut ile Eşitle
            </button>
          </div>

          {/* Export JSON Download list */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1">
                Yedek İndir (Export)
              </h4>
              <p className="text-[10px] text-slate-400">Uçtan uca şifrelenmiş harcama, taksit ve ayarlar tablonuzu şifreli dosya (.json) olarak PC/Telefona indirir.</p>
            </div>
            <button
              type="button"
              onClick={onExportBackup}
              className={`w-full mt-4 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 cursor-pointer shadow-sm transition`}
            >
              <Download className="w-3.5 h-3.5" /> Şifreli Dosya İndir
            </button>
          </div>

          {/* Import JSON Restore list */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1">
                Yedek Yükle (Import)
              </h4>
              <p className="text-[10px] text-slate-400">İndirilen şifreli backup dosyasını tekrar yükleyip verileri eski haline getirir. Şifrenizin uyuşması zorunludur.</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleImportClick}
              className={`w-full mt-4 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-transparent cursor-pointer shadow-sm transition`}
            >
              <Upload className="w-3.5 h-3.5" /> Şifreli Yedek Yükle
            </button>
          </div>
        </div>
      </div>

      {/* Password security settings change password form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Giriş Şifresini Değiştir</h3>
        </div>
        <p className="text-slate-400 text-xs mb-6">
          Uygulamaya girişte kullanılan PIN şifrenizi buradan değiştirebilirsiniz. Varsayılan şifre: <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">1234</span>
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Eski Giriş Şifresi</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Yeni Giriş Şifresi</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Yeni Şifre Onayla</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {pwError && <p className="text-red-500 font-semibold text-xs animate-shake">{pwError}</p>}
          {pwSuccess && (
            <p className="text-emerald-600 font-semibold text-xs flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" /> {pwSuccess}
            </p>
          )}

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow transition"
          >
            Şifreyi Güncelle
          </button>
        </form>
      </div>

      {/* Gemini AI API Key config */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Gemini Yapay Zeka API Anahtarı</h3>
        </div>
        <p className="text-slate-400 text-xs mb-6">
          Fiş/Fatura okuma (OCR) ve Akıllı Finansal Tasarruf raporları almak için kendi Gemini API anahtarınızı tanımlayabilirsiniz. Anahtarınız tarayıcınızda ve bulut yedeklemenizde uçtan uca şifreli olarak saklanır, asla başkasıyla paylaşılmaz.
        </p>

        <form onSubmit={(e) => {
          e.preventDefault();
          onGeminiApiKeyChange(apiKeyInput);
          setApiKeySuccess("Gemini API anahtarınız başarıyla güncellendi.");
          setTimeout(() => setApiKeySuccess(""), 3000);
        }} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Gemini API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {apiKeySuccess && (
            <p className="text-emerald-600 font-semibold text-xs flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" /> {apiKeySuccess}
            </p>
          )}

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow transition"
          >
            API Anahtarını Kaydet
          </button>
        </form>
      </div>
    </div>
  );
}
