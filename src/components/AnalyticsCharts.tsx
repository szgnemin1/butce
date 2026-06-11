import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Transaction } from "../types";
import { CATEGORIES } from "../utils/mockData";
import { TrendingDown, Percent, Wallet, BarChart3, PieChartIcon } from "lucide-react";

interface AnalyticsChartsProps {
  transactions: Transaction[];
  palette: any;
}

export default function AnalyticsCharts({ transactions, palette }: AnalyticsChartsProps) {
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  // Filters to expenses
  const expenses = transactions.filter(t => t.type === "expense");
  const incomes = transactions.filter(t => t.type === "income");

  // Format data for category distribution chart
  const categoryData = CATEGORIES.map(cat => {
    const value = expenses
      .filter(t => t.category === cat.name)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      name: cat.name,
      value,
      color: cat.color
    };
  }).filter(item => item.value > 0);

  // Total expenses to calculate percentages
  const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0);

  // Calculate monthly general trend (e.g. by dates)
  // Get all unique dates from transactions (sorted)
  const uniqueDates = Array.from(new Set(transactions.map(t => t.date))).sort();
  // Get last 7 active transaction days for trend
  const trendData = uniqueDates.slice(-7).map(date => {
    const dayIncome = incomes.filter(t => t.date === date).reduce((sum, t) => sum + t.amount, 0);
    const dayExpense = expenses.filter(t => t.date === date).reduce((sum, t) => sum + t.amount, 0);
    return {
      tarih: date.substring(5), // MM-DD formatted
      Gelir: dayIncome,
      Gider: dayExpense
    };
  });

  return (
    <div className="space-y-6">
      {/* Chart Headers card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Kapsamlı Gider ve Kategori Analizi</h3>
            <p className="text-slate-400 text-xs">Harcamalarınızın kategorilere göre detaylı dağılımı ve günlük gelişim trendi.</p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-center">
            <button
              type="button"
              onClick={() => setChartType("pie")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                chartType === "pie"
                  ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" /> Pastel Dağılımı
            </button>
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                chartType === "bar"
                  ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Sütun Karşılaştırma
            </button>
          </div>
        </div>

        {totalExpenses === 0 ? (
          <div className="text-center py-16 text-slate-500">
            Analiz edilecek harcama verisi bulunamadı. Lütfen yeni harcama ekleyin.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Charts Component (Pie/Bar) */}
            <div className="lg:col-span-7 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "pie" ? (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="55%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number) => [`${val.toLocaleString("tr-TR")} TL`, "Harcama"]}
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                    />
                  </PieChart>
                ) : (
                  <BarChart data={categoryData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(val: number) => [`${val.toLocaleString("tr-TR")} TL`, "Harcama"]}
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Structured Table metrics */}
            <div className="lg:col-span-5 space-y-3">
              <h4 className="font-semibold text-slate-700 dark:text-slate-400 text-xs uppercase tracking-wider">
                Kategori Detay Oranları
              </h4>
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {categoryData.map(item => {
                  const pct = totalExpenses > 0 ? Math.round((item.value / totalExpenses) * 100) : 0;
                  return (
                    <div key={item.name} className="flex flex-col gap-1 p-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-slate-500 font-mono font-semibold">
                          {item.value.toLocaleString("tr-TR")} TL ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Financial trend and gap */}
      {trendData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm md:text-base mb-1">Dönemsel Gelir ve Gider Dengesi</h3>
          <p className="text-slate-400 text-xs mb-4">Son aktif günlerinizin karşılaştırmalı finansal akışı.</p>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey="tarih" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Gelir" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gider" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
