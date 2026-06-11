import React, { useState } from "react";
import { Sparkles, Loader2, RefreshCw, Send, AlertCircle, FileSpreadsheet } from "lucide-react";
import { Transaction, BudgetGoal, Installment } from "../types";

interface AiReportsProps {
  transactions: Transaction[];
  goals: BudgetGoal[];
  installments: Installment[];
  palette: any;
}

export default function AiReports({
  transactions,
  goals,
  installments,
  palette
}: AiReportsProps) {
  const [reportText, setReportText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const generateReport = async () => {
    setIsLoading(true);
    setLoadingMessage("Finansal verileriniz paketleniyor...");

    const messages = [
      "Harcama kategorileri analiz ediliyor...",
      "Taksit ödeme yükleriniz hesaplanıyor...",
      "Bütçe aşım performansınız inceleniyor...",
      "Yapay zeka tasarruf modelleri simüle ediliyor...",
      "Kişiye özel rapor oluşturuluyor..."
    ];
    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < messages.length) {
        setLoadingMessage(messages[msgIdx++]);
      }
    }, 2000);

    // Calculate dynamic stats to feed into AI
    const expenses = transactions.filter(t => t.type === "expense");
    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);

    const categoryMap: { [key: string]: number } = {};
    expenses.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const activeInstallmentsCount = installments.length;
    const totalRemainingInstallmentsCost = installments.reduce((sum, i) => {
      const paid = i.currentInstallment * i.monthlyAmount;
      return sum + (i.totalAmount - paid);
    }, 0);

    const monthlyStats = {
      overall: {
        totalIncome,
        totalExpenses: totalSpent,
        netSavingsRatio: totalIncome > 0 ? parseFloat(((totalIncome - totalSpent) / totalIncome).toFixed(2)) : 0
      },
      categoryDistribution: categoryMap,
      installments: {
        count: activeInstallmentsCount,
        totalRemainingLiability: totalRemainingInstallmentsCost
      },
      goalsStatus: goals.map(g => ({
        category: g.category,
        limit: g.limitAmount,
        ratio: g.limitAmount > 0 ? parseFloat(( (categoryMap[g.category] || 0) / g.limitAmount ).toFixed(2)) : 0
      }))
    };

    try {
      const response = await fetch("/api/fin-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyStats })
      });

      if (!response.ok) {
        throw new Error("Tasarruf raporu oluşturulamadı.");
      }

      const data = await response.json();
      setReportText(data.report || "Rapora ulaşılamadı.");
    } catch (err) {
      console.error(err);
      alert("Yapay zeka tavsiyeleri şu anda alınamıyor. İnternet bağlantınızı kontrol edin.");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  // Safe and super simple Markdown formatter to render headers, bullet points, and emphasis perfectly
  const renderMarkdownText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();

      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mt-4 mb-2">
            {trimmed.replace("###", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-6 mb-3 border-b pb-1 dark:border-slate-800">
            {trimmed.replace("##", "").trim()}
          </h3>
        );
      }
      if (trimmed.startsWith("#")) {
        return (
          <h2 key={idx} className="text-lg font-black text-slate-900 dark:text-white mt-8 mb-4">
            {trimmed.replace("#", "").trim()}
          </h2>
        );
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const itemText = trimmed.replace(/^[-*]\s*/, "");
        // bold subtext parsing inside bullets e.g. **bold**: text
        return (
          <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 ml-4 list-disc py-1 font-medium">
            {parseInlines(itemText)}
          </li>
        );
      }

      if (trimmed.length === 0) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed py-1">
          {parseInlines(trimmed)}
        </p>
      );
    });
  };

  const parseInlines = (rawText: string) => {
    // Basic bold parsing: **text**
    const parts = rawText.split(/\*\*(.*?)\*\*/g);
    if (parts.length === 1) return rawText;

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold text-slate-800 dark:text-white">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Yapay Zeka Tasarruf & Öneri Raporu</h3>
          </div>
          <p className="text-slate-400 text-xs">Aylık finansal durumunuza göre kişiselleştirilmiş bütçe analizi alın.</p>
        </div>

        {reportText && !isLoading && (
          <button
            type="button"
            onClick={generateReport}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 text-xs font-bold rounded-xl cursor-pointer shadow flex items-center gap-1.5 transition self-start select-none"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Raporu Yeniden Oluştur
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Finansal Verileriniz İnceleniyor</h4>
            <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider mt-1">{loadingMessage}</p>
          </div>
        </div>
      )}

      {!reportText && !isLoading && (
        <div className="border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-full text-emerald-600">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Akıllı Tavaniye Raporu Hazır</h4>
            <p className="text-xs text-slate-400">
              Yapay zeka motorumuz harcamalarınızı, taksit planlarınızı ve aylık bütçe hedeflerinizi derinlemesine inceleyerek somut tasarruf tavsiyelerinde bulunur.
            </p>
          </div>
          <button
            type="button"
            onClick={generateReport}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition active:scale-95 flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" /> Analizi Başlat ve Rapor Al
          </button>
        </div>
      )}

      {reportText && !isLoading && (
        <div className="bg-slate-50 dark:bg-slate-800/20 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 max-h-[500px] overflow-y-auto border-t-4 border-t-emerald-500 animate-fadeIn pr-2">
          {renderMarkdownText(reportText)}
        </div>
      )}
    </div>
  );
}
