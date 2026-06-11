import React, { useState } from "react";
import { Plus, Trash2, Award, AlertCircle, HeartCrack } from "lucide-react";
import { BudgetGoal, Transaction } from "../types";
import { CATEGORIES } from "../utils/mockData";

interface GoalsTrackerProps {
  goals: BudgetGoal[];
  transactions: Transaction[];
  onAddGoal: (g: Omit<BudgetGoal, "id" | "spentAmount">) => void;
  onDeleteGoal: (id: string) => void;
  palette: any;
}

export default function GoalsTracker({
  goals,
  transactions,
  onAddGoal,
  onDeleteGoal,
  palette
}: GoalsTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [goalCategory, setGoalCategory] = useState("Gıda");
  const [goalLimit, setGoalLimit] = useState("");
  const [goalMonth, setGoalMonth] = useState("2026-06"); // default to current date month

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = parseFloat(goalLimit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) return;

    onAddGoal({
      category: goalCategory,
      limitAmount: parsedLimit,
      month: goalMonth
    });

    setGoalLimit("");
    setShowAddForm(false);
  };

  // Dynamically calculate spent amount on category for specific goal month/year
  const getDynamicSpent = (category: string, month: string) => {
    return transactions
      .filter(t => {
        const matchType = t.type === "expense";
        const matchCat = t.category === category;
        const matchMonth = t.date.startsWith(month); // YYYY-MM Matches
        return matchType && matchCat && matchMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left pane: Add target goal limit */}
      <div className="lg:col-span-1 space-y-4">
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Yeni Bütçe Hedefi Belirle
        </button>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Harcama Sınırı Ayarları</h3>

            {/* Category dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Kategori</label>
              <select
                value={goalCategory}
                onChange={(e) => setGoalCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Monthly limit limitAmount */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Aylık Limit Tutarı (TL)</label>
              <input
                type="number"
                required
                value={goalLimit}
                onChange={(e) => setGoalLimit(e.target.value)}
                placeholder="5000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Month indicator */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Geçerli Ay</label>
              <input
                type="month"
                required
                value={goalMonth}
                onChange={(e) => setGoalMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow"
              >
                Hedefi Ekle
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right pane: Goals list with progress trackers */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">Mevcut Bütçe Limitleri & İlerleme</h3>

          {goals.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Kayıtlı limit bulunmamaktadır. Yeni limitler belirleyerek harcamalarınızı kontrol altında tutabilirsiniz.
            </div>
          ) : (
            <div className="space-y-5">
              {goals.map(goal => {
                const dynamicSpent = getDynamicSpent(goal.category, goal.month);
                const ratio = goal.limitAmount > 0 ? (dynamicSpent / goal.limitAmount) : 0;
                const progressWidth = Math.min(100, Math.round(ratio * 100));
                
                const isOver = dynamicSpent > goal.limitAmount;
                const isRisk = !isOver && ratio >= 0.85;

                return (
                  <div key={goal.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800/70 space-y-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{goal.category}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Bütçe Ayı: {goal.month}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1 px-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition border border-transparent hover:border-red-200"
                        title="Hedefi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress details */}
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-500 font-medium">Harcama Durumu:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-400">
                        {dynamicSpent.toLocaleString("tr-TR")} / {goal.limitAmount.toLocaleString("tr-TR")} TL ({progressWidth}%)
                      </span>
                    </div>

                    {/* Dynamic colored bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? "bg-red-500" : isRisk ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>

                    {/* Goal messages feedback based on status */}
                    <div className="text-[11px] font-medium pt-1">
                      {isOver ? (
                        <div className="text-red-600 dark:text-red-400 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 px-2.5 py-1.5 rounded-lg border border-red-100">
                          <HeartCrack className="w-4 h-4 shrink-0" />
                          <span>Maksimum limit aşıldı! Bu kategorideki harcamaları acilen azaltmalısınız.</span>
                        </div>
                      ) : isRisk ? (
                        <div className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1.5 rounded-lg border border-amber-100">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Limitin %85'ine ulaştınız. Harcama sınırına yaklaştınız.</span>
                        </div>
                      ) : (
                        <div className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                          <Award className="w-4 h-4 shrink-0" />
                          <span>Harika ilerleme! Bütçe hedefinize sadık kalıyor ve tasarruf ediyorsunuz.</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
