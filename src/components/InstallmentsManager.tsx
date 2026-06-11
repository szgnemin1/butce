import React, { useState } from "react";
import { Plus, Trash2, CalendarHeart, Receipt, WalletCards, Sparkles, CreditCard, Coins, Wallet } from "lucide-react";
import { Transaction, Installment } from "../types";
import { CATEGORIES } from "../utils/mockData";

interface InstallmentsManagerProps {
  transactions: Transaction[];
  installments: Installment[];
  onAddTransaction: (t: Omit<Transaction, "id">) => void;
  onAddInstallment: (i: Omit<Installment, "id">) => void;
  onDeleteTransaction: (id: string) => void;
  onDeleteInstallment: (id: string) => void;
  onPayInstallment: (id: string) => void;
  palette: any;
}

export default function InstallmentsManager({
  transactions,
  installments,
  onAddTransaction,
  onAddInstallment,
  onDeleteTransaction,
  onDeleteInstallment,
  onPayInstallment,
  palette
}: InstallmentsManagerProps) {
  // Tabs "transactions" / "installments"
  const [activeSubTab, setActiveSubTab] = useState<"transactions" | "installments">("transactions");

  // Form states
  const [showAddTrForm, setShowAddTrForm] = useState(false);
  const [showAddInstForm, setShowAddInstForm] = useState(false);

  // Transaction form state
  const [trType, setTrType] = useState<"income" | "expense">("expense");
  const [trAmount, setTrAmount] = useState("");
  const [trCategory, setTrCategory] = useState("Gıda");
  const [trDate, setTrDate] = useState("2026-06-11"); // default to current date
  const [trDesc, setTrDesc] = useState("");
  const [trPaymentMethod, setTrPaymentMethod] = useState<string>("Nakit");

  // Installment form state
  const [instTitle, setInstTitle] = useState("");
  const [instTotal, setInstTotal] = useState("");
  const [instCount, setInstCount] = useState("6");
  const [instCurrent, setInstCurrent] = useState("1");
  const [instCategory, setInstCategory] = useState("Alışveriş");
  const [instDate, setInstDate] = useState("2026-06-11");
  const [instDesc, setInstDesc] = useState("");

  // Filters for transactions list
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const handleTrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(trAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !trDesc.trim()) return;

    onAddTransaction({
      type: trType,
      amount: parsedAmount,
      category: trCategory,
      date: trDate,
      description: trDesc.trim(),
      paymentMethod: trType === "expense" ? trPaymentMethod : undefined
    });

    // Reset Form
    setTrAmount("");
    setTrDesc("");
    setShowAddTrForm(false);
  };

  const handleInstSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTotal = parseFloat(instTotal);
    const parsedCount = parseInt(instCount);
    const parsedCurrent = parseInt(instCurrent);

    if (
      isNaN(parsedTotal) || parsedTotal <= 0 ||
      isNaN(parsedCount) || parsedCount <= 0 ||
      isNaN(parsedCurrent) || parsedCurrent < 0 ||
      !instTitle.trim()
    ) return;

    const monthlyAmount = parseFloat((parsedTotal / parsedCount).toFixed(2));

    onAddInstallment({
      title: instTitle.trim(),
      totalAmount: parsedTotal,
      category: instCategory,
      totalInstallments: parsedCount,
      currentInstallment: parsedCurrent,
      monthlyAmount,
      startDate: instDate,
      description: instDesc.trim()
    });

    // Reset Form
    setInstTitle("");
    setInstTotal("");
    setInstCount("6");
    setInstCurrent("1");
    setInstDesc("");
    setShowAddInstForm(false);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesCat = filterCategory === "all" || t.category === filterCategory;
    return matchesType && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Selector tab switch */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start max-w-xs transition">
        <button
          type="button"
          onClick={() => setActiveSubTab("transactions")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === "transactions"
              ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Receipt className="w-4 h-4" /> Harcamalar
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("installments")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === "installments"
              ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <WalletCards className="w-4 h-4" /> Taksitler
        </button>
      </div>

      {activeSubTab === "transactions" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Add Transaction Form */}
          <div className="lg:col-span-1 space-y-4">
            <button
              type="button"
              onClick={() => setShowAddTrForm(!showAddTrForm)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Yeni Harcama / Gelir Ekle
            </button>

            {showAddTrForm && (
              <form onSubmit={handleTrSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">İşlem Detayları</h3>
                
                {/* Type toggle */}
                <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTrType("expense")}
                    className={`py-1.5 rounded-lg text-xs font-semibold select-none cursor-pointer transition ${
                      trType === "expense" ? "bg-red-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                  >
                    Gider / Harcama
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrType("income")}
                    className={`py-1.5 rounded-lg text-xs font-semibold select-none cursor-pointer transition ${
                      trType === "income" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                  >
                    Gelir
                  </button>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tutar (TL)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={trAmount}
                    onChange={(e) => setTrAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Kategori</label>
                  <select
                    value={trCategory}
                    onChange={(e) => setTrCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Ödeme Yöntemi */}
                {trType === "expense" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Ödeme Yöntemi</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "Nakit", label: "Nakit", icon: Coins },
                        { id: "Kredi Kartı", label: "Kredi Kartı", icon: CreditCard },
                        { id: "Banka Kartı", label: "Banka Kartı", icon: Wallet }
                      ].map((m) => {
                        const Icon = m.icon;
                        const isSelected = trPaymentMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setTrPaymentMethod(m.id)}
                            className={`flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-xl border text-[11px] font-bold transition select-none cursor-pointer ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tarih</label>
                  <input
                    type="date"
                    required
                    value={trDate}
                    onChange={(e) => setTrDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Açıklama</label>
                  <input
                    type="text"
                    required
                    value={trDesc}
                    onChange={(e) => setTrDesc(e.target.value)}
                    placeholder="Market alışverişi, kira fatura vb..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTrForm(false)}
                    className="flex-1 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right panel: Transactions List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Harcama ve Gelir Arşivi</h3>
                
                {/* Advanced list filters */}
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-400 focus:outline-none"
                  >
                    <option value="all">Tüm Biçimler</option>
                    <option value="expense">Yalnızca Giderler</option>
                    <option value="income">Yalnızca Gelirler</option>
                  </select>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-400 focus:outline-none"
                  >
                    <option value="all">Tüm Kategoriler</option>
                    {CATEGORIES.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Seçilen kriterlerde işlem kaydı bulunamadı.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto pr-1">
                  {filteredTransactions.map(t => {
                    const isExpense = t.type === "expense";
                    const catObj = CATEGORIES.find(c => c.name === t.category);

                    return (
                      <div key={t.id} className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition px-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: catObj?.color || "#9CA3AF" }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{t.description}</p>
                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span>{t.category}</span>
                              <span>•</span>
                              <span>{t.date}</span>
                              {t.installmentId && (
                                <>
                                  <span>•</span>
                                  <span className="text-indigo-500 font-bold">Taksitli</span>
                                </>
                              )}
                              {t.paymentMethod && (
                                <>
                                  <span>•</span>
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 font-bold text-[9px]">
                                    {t.paymentMethod}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold font-mono ${isExpense ? "text-slate-800 dark:text-slate-200" : "text-emerald-600"}`}>
                            {isExpense ? "-" : "+"}{t.amount.toLocaleString("tr-TR")} TL
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(t.id)}
                            className="p-1 px-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition border border-transparent hover:border-red-200"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Left panel: Add Installment Form */}
          <div className="lg:col-span-1 space-y-4">
            <button
              type="button"
              onClick={() => setShowAddInstForm(!showAddInstForm)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Yeni Taksit Planı Ekle (Taksit Ekle)
            </button>

            {showAddInstForm && (
              <form onSubmit={handleInstSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Taksit Plan Bilgileri</h3>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Harcama Başlığı</label>
                  <input
                    type="text"
                    required
                    value={instTitle}
                    onChange={(e) => setInstTitle(e.target.value)}
                    placeholder="Buzdolabı, Cep Telefonu, Sigorta..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Total amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Toplam Alışveriş Tutarı (TL)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={instTotal}
                    onChange={(e) => setInstTotal(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Slices of installments */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Toplam Taksit Sayısı</label>
                    <input
                      type="number"
                      required
                      value={instCount}
                      onChange={(e) => setInstCount(e.target.value)}
                      placeholder="6"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ödenen Taksit Sayısı</label>
                    <input
                      type="number"
                      required
                      value={instCurrent}
                      onChange={(e) => setInstCurrent(e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Harcama Kategorisi</label>
                  <select
                    value={instCategory}
                    onChange={(e) => setInstCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Start date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    required
                    value={instDate}
                    onChange={(e) => setInstDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Açıklama / Detaylar</label>
                  <input
                    type="text"
                    value={instDesc}
                    onChange={(e) => setInstDesc(e.target.value)}
                    placeholder="Mağaza adı, ek ürün detayları vb..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddInstForm(false)}
                    className="flex-1 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow"
                  >
                    Planı Ekle
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right panel: Active Installments Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">Mevcut Taksit Planları</h3>

              {installments.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Kayıtlı taksit planı bulunamadı.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {installments.map(inst => {
                    const paidAmount = inst.currentInstallment * inst.monthlyAmount;
                    const remainingAmount = inst.totalAmount - paidAmount;
                    const ratio = inst.totalInstallments > 0 ? (inst.currentInstallment / inst.totalInstallments) : 0;
                    const progressWidth = Math.round(ratio * 100);
                    const isFullyPaid = inst.currentInstallment >= inst.totalInstallments;

                    return (
                      <div key={inst.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800/70 flex flex-col justify-between gap-3 shadow-sm">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[150px]">{inst.title}</h4>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-semibold">
                              {inst.category}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 mt-1 truncate">{inst.description || "Açıklama girilmemiş"}</p>

                          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                            <div>
                              <p className="text-slate-400 text-[10px]">Toplam Ödeme</p>
                              <span className="font-bold text-slate-700 dark:text-slate-350">{inst.totalAmount.toLocaleString("tr-TR")} TL</span>
                            </div>
                            <div>
                              <p className="text-slate-400 text-[10px]">Aylık Taksit</p>
                              <span className="font-bold text-indigo-550 dark:text-indigo-400">{inst.monthlyAmount.toLocaleString("tr-TR")} TL</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                              <span>İlerleme ({progressWidth}%)</span>
                              <span className="font-mono">{inst.currentInstallment} / {inst.totalInstallments}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full" 
                                style={{ width: `${progressWidth}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/50 mt-1">
                          <button
                            type="button"
                            onClick={() => onDeleteInstallment(inst.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg cursor-pointer transition border border-transparent hover:border-red-200"
                            title="Plânı Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            disabled={isFullyPaid}
                            onClick={() => onPayInstallment(inst.id)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1 transition ${
                              isFullyPaid 
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800" 
                                : "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {isFullyPaid ? "Tamamlandı" : "Taksit Öde"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
