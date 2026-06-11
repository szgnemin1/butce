import React from "react";
import { TrendingUp, TrendingDown, Wallet, Calendar, AlertTriangle, CheckCircle, BellRing, ArrowRight } from "lucide-react";
import { Transaction, BudgetGoal, Reminder, Installment } from "../types";
import { CATEGORIES } from "../utils/mockData";

interface DashboardOverviewProps {
  transactions: Transaction[];
  goals: BudgetGoal[];
  reminders: Reminder[];
  installments: Installment[];
  palette: any;
  onNavigate: (tab: string) => void;
}

export default function DashboardOverview({
  transactions,
  goals,
  reminders,
  installments,
  palette,
  onNavigate
}: DashboardOverviewProps) {
  // Financial Calculations
  const incomeTotal = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseTotal = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = incomeTotal - expenseTotal;

  // Next upcoming tasks / bills / installments due this month
  const activeRemindersCount = reminders.filter(r => r.isActive).length;
  
  // Find goals approaching or exceeding limit
  const endangeredGoals = goals.filter(g => {
    // Calculate actual spent dynamically to make sure it's accurate
    const actualSpent = transactions
      .filter(t => t.type === "expense" && t.category === g.category)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return actualSpent >= g.limitAmount * 0.85;
  });

  // Calculate dynamic spent on goals
  const getGoalStatus = (goal: BudgetGoal) => {
    const actualSpent = transactions
      .filter(t => t.type === "expense" && t.category === goal.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const ratio = goal.limitAmount > 0 ? (actualSpent / goal.limitAmount) : 0;
    return { actualSpent, ratio };
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Alerts / Notification Center */}
      {(endangeredGoals.length > 0 || reminders.some(r => r.isActive)) && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
            <h3 className="font-bold text-amber-800 dark:text-amber-300 text-sm md:text-base">
              Önemli Ödeme Hatırlatıcıları ve Bildirimleri
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-amber-700 dark:text-amber-400">
            {endangeredGoals.map(goal => {
              const { actualSpent, ratio } = getGoalStatus(goal);
              const isOver = ratio >= 1;
              return (
                <div key={goal.id} className="flex items-start gap-2 bg-white/70 dark:bg-slate-900/50 p-2.5 rounded-lg border border-amber-105-0">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold">{goal.category}</span> harcama limiti tehlikede!
                    <div className="mt-1">
                      Limit: <span className="font-bold">{goal.limitAmount} TL</span> | 
                      Harcanan: <span className={isOver ? "text-red-600 font-bold" : "text-amber-600 font-bold"}>{actualSpent} TL</span> 
                      {isOver ? " (Limit Aşıldı!)" : " (%85 üzeri)"}
                    </div>
                  </div>
                </div>
              );
            })}

            {reminders.filter(r => r.isActive).slice(0, 2).map(rem => (
              <div key={rem.id} className="flex items-start gap-2 bg-white/70 dark:bg-slate-900/50 p-2.5 rounded-lg border border-amber-105-0">
                <Calendar className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  Yaklaşan Ödeme: <span className="font-semibold">{rem.title}</span> ({rem.amount} TL)
                  <p className="text-slate-400 text-[10px] mt-0.5">Son Gün: {rem.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Net Durum</p>
            <h3 className={`text-2xl font-bold tracking-tight mt-1 ${netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
              {netBalance.toLocaleString("tr-TR")} TL
            </h3>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <Wallet className="w-6 h-6 text-slate-500 dark:text-slate-300" />
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Aylık Toplam Gelir</p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
              +{incomeTotal.toLocaleString("tr-TR")} TL
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Aylık Toplam Gider</p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-red-500">
              -{expenseTotal.toLocaleString("tr-TR")} TL
            </h3>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl">
            <TrendingDown className="w-6 h-6 text-red-500" />
          </div>
        </div>

        {/* Upcoming Bills & Installs */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Hatırlatıcı & Taksit</p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-indigo-600 dark:text-indigo-400">
              {activeRemindersCount} Ödeme
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl">
            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Target Progress Quick Check */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Bütçe Hedefleri Durum Paneli</h3>
          <button 
            type="button" 
            onClick={() => onNavigate("goals")}
            className={`text-xs font-semibold flex items-center gap-1 cursor-pointer hover:underline ${palette.text}`}
          >
            Hepsini Gör <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-4 text-sm text-slate-400 dark:text-slate-500">
            Kayıtlı bütçe hedefi bulunmamaktadır. Hedefler sekmesinden yeni limit ekleyebilirsiniz.
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => {
              const { actualSpent, ratio } = getGoalStatus(goal);
              const isOver = actualSpent > goal.limitAmount;
              const formattedRatio = Math.min(100, Math.round(ratio * 100));

              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{goal.category}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      {actualSpent.toLocaleString("tr-TR")} / {goal.limitAmount.toLocaleString("tr-TR")} TL ({formattedRatio}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? "bg-red-500" : ratio > 0.85 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${formattedRatio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Split Recent Transactions / Recent Installments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions list */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Son Harcamalar & Gelirler</h3>
              <button 
                type="button" 
                onClick={() => onNavigate("expenses")}
                className={`text-xs font-semibold flex items-center gap-1 cursor-pointer hover:underline ${palette.text}`}
              >
                Tüm Veriler <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {transactions.slice(0, 5).map(t => {
                const isExpense = t.type === "expense";
                const catObj = CATEGORIES.find(c => c.name === t.category);
                
                return (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: catObj?.color || "#9CA3AF" }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{t.description}</p>
                        <p className="text-[10px] text-slate-400">{t.category} • {t.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold font-mono tracking-tight shrink-0 pl-2 ${isExpense ? "text-slate-800 dark:text-slate-200" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {isExpense ? "-" : "+"}{t.amount.toLocaleString("tr-TR")} TL
                    </span>
                  </div>
                );
              })}

              {transactions.length === 0 && (
                <div className="text-center py-6 text-sm text-slate-400">
                  Harcama kaydı bulunmamaktadır.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Installs monitoring */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Aktif Taksit Durumları</h3>
              <button 
                type="button" 
                onClick={() => onNavigate("expenses")}
                className={`text-xs font-semibold flex items-center gap-1 cursor-pointer hover:underline ${palette.text}`}
              >
                Yönet <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {installments.slice(0, 3).map(inst => {
                const ratio = inst.totalInstallments > 0 ? (inst.currentInstallment / inst.totalInstallments) : 0;
                const progressWidth = Math.round(ratio * 100);

                return (
                  <div key={inst.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{inst.title}</h4>
                        <p className="text-[10px] text-slate-400">{inst.category} • Aylık: {inst.monthlyAmount} TL</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                          {inst.currentInstallment}/{inst.totalInstallments} Taksit
                        </span>
                        <p className="text-[9px] text-slate-400">Kalan: {(inst.totalAmount - (inst.currentInstallment * inst.monthlyAmount)).toLocaleString("tr-TR")} TL</p>
                      </div>
                    </div>
                    <div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${progressWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {installments.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-400">
                  Aktif taksitli harcamanız bulunmamaktadır. Harcamalar sekmesinden taksitlendirme ekleyebilirsiniz.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
