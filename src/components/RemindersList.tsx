import React, { useState } from "react";
import { Plus, Trash2, CalendarCheck, ToggleLeft, ToggleRight, CheckSquare, Sparkles } from "lucide-react";
import { Reminder } from "../types";
import { CATEGORIES } from "../utils/mockData";

interface RemindersListProps {
  reminders: Reminder[];
  onAddReminder: (r: Omit<Reminder, "id">) => void;
  onDeleteReminder: (id: string) => void;
  onToggleReminder: (id: string) => void;
  onCompleteReminder: (id: string) => void; // automatically pays the transaction & shifts due state
  palette: any;
}

export default function RemindersList({
  reminders,
  onAddReminder,
  onDeleteReminder,
  onToggleReminder,
  onCompleteReminder,
  palette
}: RemindersListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [remTitle, setRemTitle] = useState("");
  const [remAmount, setRemAmount] = useState("");
  const [remCategory, setRemCategory] = useState("Fatura/Aidat");
  const [remDate, setRemDate] = useState("2026-06-15");
  const [remFreq, setRemFreq] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(remAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !remTitle.trim()) return;

    onAddReminder({
      title: remTitle.trim(),
      amount: parsedAmount,
      category: remCategory,
      dueDate: remDate,
      frequency: remFreq,
      isActive: true
    });

    setRemTitle("");
    setRemAmount("");
    setShowAddForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Left pane: Add local reminder */}
      <div className="lg:col-span-1 space-y-4">
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Yeni Ödeme Hatırlatıcısı Ekle
        </button>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Hatırlatıcı Detayları</h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Açıklama / Fatura İsmi</label>
              <input
                type="text"
                required
                value={remTitle}
                onChange={(e) => setRemTitle(e.target.value)}
                placeholder="Ev Kirası, Spotify, Elektrik Faturası..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ödeme Tutarı (TL)</label>
              <input
                type="number"
                required
                value={remAmount}
                onChange={(e) => setRemAmount(e.target.value)}
                placeholder="290"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Harcama Grubu (Kategori)</label>
              <select
                value={remCategory}
                onChange={(e) => setRemCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Next Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Son Ödeme Tarihi</label>
              <input
                type="date"
                required
                value={remDate}
                onChange={(e) => setRemDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Frequency selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tekrarlama Düzeni</label>
              <select
                value={remFreq}
                onChange={(e) => setRemFreq(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık / Her Ay</option>
                <option value="yearly">Yıllık</option>
              </select>
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
                Planı Ekle
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right pane: list and complete triggers */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">Abonelikler ve Düzenli Faturalar</h3>

          {reminders.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Kayıtlı aktif düzenli ödeme planı bulunmamaktadır.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 animate-fadeIn">
              {reminders.map(rem => {
                const catObj = CATEGORIES.find(c => c.name === rem.category);

                return (
                  <div key={rem.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div 
                        className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" 
                        style={{ backgroundColor: catObj?.color || "#9CA3AF" }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{rem.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Grup: {rem.category} • Vade: {rem.dueDate} ({rem.frequency === "monthly" ? "Aylık" : rem.frequency === "weekly" ? "Haftalık" : rem.frequency === "yearly" ? "Yıllık" : "Günlük"})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/50">
                      <div className="text-left sm:text-right">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">{rem.amount} TL</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle active state */}
                        <button
                          type="button"
                          onClick={() => onToggleReminder(rem.id)}
                          className="text-slate-500 hover:text-slate-600 cursor-pointer"
                          title={rem.isActive ? "Pasif Yap" : "Aktif Yap"}
                        >
                          {rem.isActive ? (
                            <ToggleRight className="w-6 h-6 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                          )}
                        </button>

                        {/* Fast check complete payment and auto-add transaction record */}
                        <button
                          type="button"
                          disabled={!rem.isActive}
                          onClick={() => onCompleteReminder(rem.id)}
                          className={`p-1.5 rounded-lg flex items-center gap-1 border transition ${
                            rem.isActive
                              ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 cursor-pointer"
                              : "bg-slate-100 text-slate-400 border-transparent cursor-not-allowed dark:bg-slate-800"
                          }`}
                          title="Faturayı Öde ve Geçmişe Ekle"
                        >
                          <CheckSquare className="w-4 h-4" />
                          <span className="text-[10px] font-bold">Öde</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteReminder(rem.id)}
                          className="p-1 px-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition border border-transparent hover:border-red-200"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
