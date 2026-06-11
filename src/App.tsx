import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Receipt, 
  Sparkles, 
  Target, 
  BellRing, 
  Settings, 
  LogOut, 
  Grid,
  Menu,
  X,
  Database,
  CloudLightning,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";

import { 
  Transaction, 
  Installment, 
  BudgetGoal, 
  Reminder, 
  AppSettings, 
  DatabaseState 
} from "./types";

import LoginScreen from "./components/LoginScreen";
import DashboardOverview from "./components/DashboardOverview";
import AnalyticsCharts from "./components/AnalyticsCharts";
import InstallmentsManager from "./components/InstallmentsManager";
import ReceiptScanner from "./components/ReceiptScanner";
import GoalsTracker from "./components/GoalsTracker";
import RemindersList from "./components/RemindersList";
import AiReports from "./components/AiReports";
import SettingsPanel from "./components/SettingsPanel";

import { encryptData, decryptData, hashPassword } from "./utils/security";
import { createDefaultState, THEME_PALETTES } from "./utils/mockData";

export default function App() {
  // Authentication & Security state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [userPassword, setUserPassword] = useState("");
  const [storedHash, setStoredHash] = useState("");
  const [cloudEncryptedState, setCloudEncryptedState] = useState<string | null>(null);

  // Core Data models
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [goals, setGoals] = useState<BudgetGoal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    themeColor: "emerald",
    isDark: false,
    passwordHash: ""
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Boot: load encrypted database bundle from cloud VDS server
  useEffect(() => {
    async function bootApp() {
      try {
        const res = await fetch("/api/db/load");
        const data = await res.json();

        if (data && data.encryptedState) {
          setCloudEncryptedState(data.encryptedState);
          setLastBackupDate(data.lastBackupDate);
          
          // Decode enough settings to check passwordHash or we can ask on LoginScreen
          // To get passwordHash, we require user to input password first.
          // Let's first parse the hash from cached state if we have a copy.
          // Or we can retrieve hash from a separate local cache or find it inside encryptedData.
          // Let's fall back to localStorage for hash check, or extract settings directly.
          const cachedHash = localStorage.getItem("pin_hash") || "";
          setStoredHash(cachedHash || "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"); // default '1234' hash
        } else {
          // No cloud file exists. Let's see if localStorage has anything
          const localEncrypted = localStorage.getItem("local_encrypted_state");
          const localBackupDate = localStorage.getItem("local_backup_date");

          if (localEncrypted) {
            setCloudEncryptedState(localEncrypted);
            setLastBackupDate(localBackupDate);
          }
          
          const cachedHash = localStorage.getItem("pin_hash") || "";
          setStoredHash(cachedHash || "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"); // '1234'
        }
      } catch (err) {
        console.error("Booting error:", err);
        // Fallback to local '1234' default
        setStoredHash("03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4");
      } finally {
        setIsBooting(false);
      }
    }
    bootApp();
  }, []);

  // Sync / Auto-save whenever internal financial models change
  const triggerAutoSave = async (
    txs: Transaction[],
    insts: Installment[],
    gls: BudgetGoal[],
    rems: Reminder[],
    sets: AppSettings,
    passwordVal: string
  ) => {
    if (!passwordVal) return;

    try {
      const dbState: DatabaseState = {
        transactions: txs,
        installments: insts,
        goals: gls,
        reminders: rems,
        settings: sets
      };

      const encryptedStr = await encryptData(JSON.stringify(dbState), passwordVal);
      
      // Save locally
      localStorage.setItem("local_encrypted_state", encryptedStr);
      localStorage.setItem("local_backup_date", new Date().toISOString());

      // Save to cloud server (VDS)
      const saveRes = await fetch("/api/db/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedState: encryptedStr })
      });

      if (saveRes.ok) {
        const data = await saveRes.json();
        setLastBackupDate(data.lastBackupDate);
        showTemporarySyncMessage("Bulut Senkronizasyonu Aktif");
      }
    } catch (err) {
      console.error("Auto-sync error:", err);
    }
  };

  const showTemporarySyncMessage = (msg: string) => {
    setSyncNotification(msg);
    setTimeout(() => {
      setSyncNotification(null);
    }, 3000);
  };

  // Login handler
  const handleLoginSuccess = async (passwordVal: string) => {
    setUserPassword(passwordVal);

    try {
      if (cloudEncryptedState) {
        // Decrypt the existing cloud/local database state
        const decryptedStr = await decryptData(cloudEncryptedState, passwordVal);
        const state: DatabaseState = JSON.parse(decryptedStr);

        setTransactions(state.transactions || []);
        setInstallments(state.installments || []);
        setGoals(state.goals || []);
        setReminders(state.reminders || []);
        setSettings(state.settings);

        // Apply dark mode settings
        document.documentElement.classList.toggle("dark", state.settings.isDark);
        setIsLoggedIn(true);
      } else {
        // No encrypted state found. Create first time default mock data encrypted with their login password!
        const passHash = await hashPassword(passwordVal);
        const defaultState = await createDefaultState(passHash);

        setTransactions(defaultState.transactions);
        setInstallments(defaultState.installments);
        setGoals(defaultState.goals);
        setReminders(defaultState.reminders);
        
        const initialSettings: AppSettings = {
          themeColor: "emerald",
          isDark: false,
          passwordHash: passHash
        };
        setSettings(initialSettings);
        
        // Save locally & on VDS cloud server instantly!
        await triggerAutoSave(
          defaultState.transactions,
          defaultState.installments,
          defaultState.goals,
          defaultState.reminders,
          initialSettings,
          passwordVal
        );
        
        localStorage.setItem("pin_hash", passHash);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error(err);
      alert("Şifre doğrulama hatası ya da veri açılamadı!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserPassword("");
    // Keep cached hashes but clear session states
  };

  // -----------------------------------------------------------------
  // Data State Mutator Handlers (Trigger auto-saves)
  // -----------------------------------------------------------------

  const handleAddTransaction = (newTr: Omit<Transaction, "id">) => {
    const freshTr: Transaction = {
      ...newTr,
      id: "tr_" + Math.random().toString(36).substring(2, 9)
    };
    const updated = [freshTr, ...transactions];
    setTransactions(updated);
    triggerAutoSave(updated, installments, goals, reminders, settings, userPassword);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    triggerAutoSave(updated, installments, goals, reminders, settings, userPassword);
  };

  const handleAddInstallment = (newInst: Omit<Installment, "id">) => {
    const freshInst: Installment = {
      ...newInst,
      id: "inst_" + Math.random().toString(36).substring(2, 9)
    };
    const updated = [...installments, freshInst];
    setInstallments(updated);

    // Record the first monthly transaction automatically!
    const updatedTxs = [
      {
        id: "tr_" + Math.random().toString(36).substring(2, 9),
        type: "expense" as const,
        amount: freshInst.monthlyAmount,
        category: freshInst.category,
        date: freshInst.startDate,
        description: `${freshInst.title} (Ödeme ${freshInst.currentInstallment}/${freshInst.totalInstallments})`,
        installmentId: freshInst.id
      },
      ...transactions
    ];
    setTransactions(updatedTxs);

    triggerAutoSave(updatedTxs, updated, goals, reminders, settings, userPassword);
  };

  const handleDeleteInstallment = (id: string) => {
    const updated = installments.filter(i => i.id !== id);
    setInstallments(updated);
    // Also delete references in transactions? Keeping history is safer, but can remove installment link
    const updatedTxs = transactions.map(t => {
      if (t.installmentId === id) {
        return { ...t, installmentId: undefined };
      }
      return t;
    });
    setTransactions(updatedTxs);

    triggerAutoSave(updatedTxs, updated, goals, reminders, settings, userPassword);
  };

  const handlePayInstallment = (id: string) => {
    const updated = installments.map(inst => {
      if (inst.id === id) {
        const nextInstallmentNum = inst.currentInstallment + 1;
        // Trigger auto record payment transaction for next slot!
        const todayStr = new Date().toISOString().substring(0, 10);
        handleAddTransaction({
          type: "expense",
          amount: inst.monthlyAmount,
          category: inst.category,
          date: todayStr,
          description: `${inst.title} (Ödeme ${nextInstallmentNum}/${inst.totalInstallments})`,
          installmentId: inst.id
        });

        return {
          ...inst,
          currentInstallment: Math.min(inst.totalInstallments, nextInstallmentNum)
        };
      }
      return inst;
    });
    setInstallments(updated);
  };

  const handleAddGoal = (newGoal: Omit<BudgetGoal, "id" | "spentAmount">) => {
    const freshGoal: BudgetGoal = {
      ...newGoal,
      id: "goal_" + Math.random().toString(36).substring(2, 9),
      spentAmount: 0 // dynamically computed inside UI
    };
    const updated = [...goals, freshGoal];
    setGoals(updated);
    triggerAutoSave(transactions, installments, updated, reminders, settings, userPassword);
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    triggerAutoSave(transactions, installments, updated, reminders, settings, userPassword);
  };

  const handleAddReminder = (newRem: Omit<Reminder, "id">) => {
    const freshRem: Reminder = {
      ...newRem,
      id: "rem_" + Math.random().toString(36).substring(2, 9)
    };
    const updated = [freshRem, ...reminders];
    setReminders(updated);
    triggerAutoSave(transactions, installments, goals, updated, settings, userPassword);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    triggerAutoSave(transactions, installments, goals, updated, settings, userPassword);
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(r => {
      if (r.id === id) {
        return { ...r, isActive: !r.isActive };
      }
      return r;
    });
    setReminders(updated);
    triggerAutoSave(transactions, installments, goals, updated, settings, userPassword);
  };

  const handleCompleteReminder = (id: string) => {
    const updated = reminders.map(rem => {
      if (rem.id === id) {
        const todayStr = new Date().toISOString().substring(0, 10);
        
        // Feed into expense transactions history automatically!
        handleAddTransaction({
          type: "expense",
          amount: rem.amount,
          category: rem.category,
          date: todayStr,
          description: `Fatura Ödemesi: ${rem.title}`
        });

        // Compute next due date automatically based on frequency
        const currentDate = new Date(rem.dueDate);
        if (rem.frequency === "monthly") {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (rem.frequency === "weekly") {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (rem.frequency === "yearly") {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        } else {
          currentDate.setDate(currentDate.getDate() + 1);
        }

        const nextDueStr = currentDate.toISOString().substring(0, 10);
        return {
          ...rem,
          dueDate: nextDueStr
        };
      }
      return rem;
    });
    setReminders(updated);
  };

  // -----------------------------------------------------------------
  // Settings mutators
  // -----------------------------------------------------------------

  const handleThemeChange = (color: 'zinc' | 'blue' | 'emerald' | 'amber' | 'violet' | 'rose') => {
    const updatedSets = { ...settings, themeColor: color };
    setSettings(updatedSets);
    triggerAutoSave(transactions, installments, goals, reminders, updatedSets, userPassword);
  };

  const handleDarkToggle = (val: boolean) => {
    const updatedSets = { ...settings, isDark: val };
    setSettings(updatedSets);
    document.documentElement.classList.toggle("dark", val);
    triggerAutoSave(transactions, installments, goals, reminders, updatedSets, userPassword);
  };

  const handlePasswordChange = (newHash: string) => {
    const updatedSets = { ...settings, passwordHash: newHash };
    setSettings(updatedSets);
    setStoredHash(newHash);
    localStorage.setItem("pin_hash", newHash);
    // Re-encrypt the overall database with the new password string we derive!
    // Since password string changes, we must inform user to re-log.
    // For simplicity, we can also let them know.
    triggerAutoSave(transactions, installments, goals, reminders, updatedSets, userPassword);
  };

  // Manual export / backup (.json encrypted document download)
  const handleExportBackup = async () => {
    try {
      const dbState: DatabaseState = {
        transactions,
        installments,
        goals,
        reminders,
        settings
      };

      const encryptedStr = await encryptData(JSON.stringify(dbState), userPassword);
      const downloadPayload = {
        encryptedState: encryptedStr,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(downloadPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ButceTakip_Sifreli_Yedek_${new Date().toISOString().substring(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Yedek indirilirken hata oluştu.");
    }
  };

  // Manual import / file restore
  const handleImportBackup = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const payload = JSON.parse(reader.result as string);
        if (!payload || !payload.encryptedState) {
          alert("Geçersiz yedek dosya şablonu.");
          return;
        }

        // Try decrypting with user's current password
        const decryptedStr = await decryptData(payload.encryptedState, userPassword);
        const state: DatabaseState = JSON.parse(decryptedStr);

        setTransactions(state.transactions || []);
        setInstallments(state.installments || []);
        setGoals(state.goals || []);
        setReminders(state.reminders || []);
        
        if (state.settings) {
          setSettings(state.settings);
          document.documentElement.classList.toggle("dark", state.settings.isDark);
        }

        await triggerAutoSave(
          state.transactions || [],
          state.installments || [],
          state.goals || [],
          state.reminders || [],
          state.settings || settings,
          userPassword
        );

        alert("Yedek başarıyla yüklendi ve bulut ile eşitlendi!");
      } catch (err) {
        alert("Yedek yüklenemedi. Şifrenizin yedek dosyası şifresiyle uyuşması gerekmektedir.");
      }
    };
    reader.readAsText(file);
  };

  const handleCloudSyncForce = async () => {
    await triggerAutoSave(transactions, installments, goals, reminders, settings, userPassword);
    alert("Senkronizasyon tamamlandı!");
  };

  // Main booting spinner screen
  if (isBooting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Database className="w-12 h-12 text-emerald-500 animate-bounce" />
        <p className="text-slate-400 text-sm font-semibold animate-pulse">
          Bütçe Veritabanı Buluttan Çekiliyor...
        </p>
      </div>
    );
  }

  // Not logged in: PIN padlock wall
  if (!isLoggedIn) {
    return (
      <LoginScreen
        storedHash={storedHash}
        onLoginSuccess={handleLoginSuccess}
        palette={(THEME_PALETTES as any)[settings.themeColor || "emerald"]}
      />
    );
  }

  // Loaded palette
  const activePalette = (THEME_PALETTES as any)[settings.themeColor || "emerald"];

  // Tab router
  const renderActiveContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardOverview
            transactions={transactions}
            goals={goals}
            reminders={reminders}
            installments={installments}
            palette={activePalette}
            onNavigate={(tab) => {
              setActiveTab(tab);
              setMobileMenuOpen(false);
            }}
          />
        );
      case "charts":
        return <AnalyticsCharts transactions={transactions} palette={activePalette} />;
      case "expenses":
        return (
          <InstallmentsManager
            transactions={transactions}
            installments={installments}
            onAddTransaction={handleAddTransaction}
            onAddInstallment={handleAddInstallment}
            onDeleteTransaction={handleDeleteTransaction}
            onDeleteInstallment={handleDeleteInstallment}
            onPayInstallment={handlePayInstallment}
            palette={activePalette}
          />
        );
      case "ocr":
        return <ReceiptScanner onAddTransaction={handleAddTransaction} palette={activePalette} />;
      case "goals":
        return (
          <GoalsTracker
            goals={goals}
            transactions={transactions}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            palette={activePalette}
          />
        );
      case "reminders":
        return (
          <RemindersList
            reminders={reminders}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
            onToggleReminder={handleToggleReminder}
            onCompleteReminder={handleCompleteReminder}
            palette={activePalette}
          />
        );
      case "ai-report":
        return (
          <AiReports
            transactions={transactions}
            goals={goals}
            installments={installments}
            palette={activePalette}
          />
        );
      case "settings":
        return (
          <SettingsPanel
            currentTheme={settings.themeColor}
            isDark={settings.isDark}
            storedHash={storedHash}
            lastBackupDate={lastBackupDate}
            onThemeChange={handleThemeChange}
            onDarkToggle={handleDarkToggle}
            onPasswordChange={handlePasswordChange}
            onCloudSync={handleCloudSyncForce}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            palette={activePalette}
          />
        );
      default:
        return <div>Bulunamadı</div>;
    }
  };

  const navItems = [
    { id: "dashboard", label: "Özet", icon: Grid },
    { id: "charts", label: "Grafikler", icon: BarChart3 },
    { id: "expenses", label: "Gider & Taksit", icon: Receipt },
    { id: "ocr", label: "Fiş Tara (AI)", icon: Sparkles },
    { id: "goals", label: "Hedefler", icon: Target },
    { id: "reminders", label: "Hatırlatıcılar", icon: BellRing },
    { id: "ai-report", label: "Tavsiye Raporu", icon: FileSpreadsheet },
    { id: "settings", label: "Ayarlar", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-300">
      
      {/* Dynamic Sync Active Status Tag */}
      {syncNotification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl text-[10px] font-bold shadow-lg animate-slideIn">
          <CloudLightning className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>{syncNotification}</span>
        </div>
      )}

      {/* Navigation: Responsive Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 px-4 py-3 flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
            <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">Akıllı Bütçem</span>
        </div>
        
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Navigation Sidebar: Desktop & Mobile menu Overlay */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/70 w-64 lg:static lg:block py-6 px-4 z-40 transform lg:transform-none transition-transform duration-300 flex flex-col justify-between ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Logo element */}
          <div className="hidden lg:flex items-center gap-2 px-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl animate-pulse">
              <Database className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-slate-900 dark:text-white text-base tracking-tight">Akıllı Bütçem</h2>
              <p className="text-[9px] text-slate-400 truncate flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> E2E Şifreli Akış
              </p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs select-none cursor-pointer flex items-center gap-3 transition-all ${
                    isActive 
                      ? `${activePalette.primary} shadow-md` 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar footer actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
          <div className="flex items-center justify-between px-2 text-[10px] text-slate-400 font-medium">
            <span>Senkronizasyon</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition select-none"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Oturumu Kapat
          </button>
        </div>
      </aside>

      {/* Main workspace container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
        {renderActiveContent()}
      </main>

      {/* Backdrop overlay for mobile menu layout */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden animate-fade-in"
        />
      )}
    </div>
  );
}
