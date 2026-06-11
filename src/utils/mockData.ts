import { DatabaseState } from "../types";

export const createDefaultState = async (passwordHash: string): Promise<DatabaseState> => {
  return {
    transactions: [
      {
        id: "t1",
        type: "expense",
        amount: 280,
        category: "Gıda",
        date: "2026-06-10",
        description: "Market Alışverişi"
      },
      {
        id: "t2",
        type: "expense",
        amount: 1500,
        category: "Fatura/Aidat",
        date: "2026-06-08",
        description: "Elektrik ve İnternet Faturası"
      },
      {
        id: "t3",
        type: "expense",
        amount: 350,
        category: "Ulaşım",
        date: "2026-06-09",
        description: "Aylık Akbil Dolumu"
      },
      {
        id: "t4",
        type: "income",
        amount: 25000,
        category: "Diğer",
        date: "2026-06-01",
        description: "Maaş Ödemesi"
      },
      {
        id: "t5",
        type: "expense",
        amount: 1200,
        category: "Alışveriş",
        date: "2026-06-05",
        description: "Yazlık Kıyafet Alımı"
      }
    ],
    installments: [
      {
        id: "i1",
        title: "Buzdolabı Taksiti",
        totalAmount: 12000,
        category: "Alışveriş",
        totalInstallments: 12,
        currentInstallment: 4,
        monthlyAmount: 1000,
        startDate: "2026-03-01",
        description: "Beyaz Eşya Mağazası"
      },
      {
        id: "i2",
        title: "Telefon Taksiti",
        totalAmount: 18000,
        category: "Alışveriş",
        totalInstallments: 6,
        currentInstallment: 2,
        monthlyAmount: 3000,
        startDate: "2026-05-01",
        description: "Cep Telefonu"
      }
    ],
    goals: [
      {
        id: "g1",
        category: "Gıda",
        limitAmount: 6000,
        spentAmount: 280,
        month: "2026-06"
      },
      {
        id: "g2",
        category: "Alışveriş",
        limitAmount: 8000,
        spentAmount: 1200,
        month: "2026-06"
      },
      {
        id: "g3",
        category: "Ulaşım",
        limitAmount: 2000,
        spentAmount: 350,
        month: "2026-06"
      }
    ],
    reminders: [
      {
        id: "r1",
        title: "Kira Ödemesi",
        amount: 12000,
        category: "Fatura/Aidat",
        dueDate: "2026-06-15",
        frequency: "monthly",
        isActive: true
      },
      {
        id: "r2",
        title: "İnternet Aboneliği",
        amount: 290,
        category: "Fatura/Aidat",
        dueDate: "2026-06-20",
        frequency: "monthly",
        isActive: true
      },
      {
        id: "r3",
        title: "Spor Salonu Üyeliği",
        amount: 600,
        category: "Sağlık",
        dueDate: "2026-06-25",
        frequency: "monthly",
        isActive: false
      }
    ],
    settings: {
      themeColor: "emerald",
      isDark: false,
      passwordHash: passwordHash
    }
  };
};

export const CATEGORIES = [
  { name: "Maaş", color: "#059669", icon: "Briefcase" },
  { name: "Burs", color: "#3B82F6", icon: "GraduationCap" },
  { name: "Yatırım Geliri", color: "#14B8A6", icon: "TrendingUp" },
  { name: "Ek Gelir", color: "#22C55E", icon: "DollarSign" },
  { name: "Gıda", color: "#10B981", icon: "Utensils" },
  { name: "Market", color: "#84CC16", icon: "ShoppingCart" },
  { name: "Alışveriş", color: "#EC4899", icon: "ShoppingBag" },
  { name: "Ulaşım", color: "#F59E0B", icon: "Car" },
  { name: "Fatura/Aidat", color: "#EF4444", icon: "FileText" },
  { name: "Kira", color: "#DC2626", icon: "Home" },
  { name: "Eğlence", color: "#8B5CF6", icon: "Film" },
  { name: "Sağlık", color: "#F43F5E", icon: "Heart" },
  { name: "Eğitim", color: "#6366F1", icon: "GraduationCap" },
  { name: "Kişisel Bakım", color: "#D946EF", icon: "Sparkles" },
  { name: "Diğer", color: "#6B7280", icon: "Layers" }
];

export const THEME_PALETTES = {
  emerald: {
    primary: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white",
    text: "text-emerald-600",
    border: "border-emerald-600",
    accent: "emerald",
    gradient: "from-emerald-500 to-teal-600",
    focus: "focus:ring-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
  },
  blue: {
    primary: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white",
    text: "text-blue-600",
    border: "border-blue-600",
    accent: "blue",
    gradient: "from-blue-500 to-indigo-600",
    focus: "focus:ring-blue-500",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
  },
  zinc: {
    primary: "bg-zinc-800 hover:bg-zinc-900 active:bg-zinc-950 text-white",
    text: "text-zinc-800 dark:text-zinc-200",
    border: "border-zinc-800 dark:border-zinc-200",
    accent: "zinc",
    gradient: "from-zinc-700 to-zinc-900",
    focus: "focus:ring-zinc-800",
    badge: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
  },
  amber: {
    primary: "bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white",
    text: "text-amber-600",
    border: "border-amber-600",
    accent: "amber",
    gradient: "from-amber-500 to-orange-600",
    focus: "focus:ring-amber-500",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
  },
  violet: {
    primary: "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white",
    text: "text-violet-600",
    border: "border-violet-600",
    accent: "violet",
    gradient: "from-violet-500 to-fuchsia-600",
    focus: "focus:ring-violet-500",
    badge: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400"
  },
  rose: {
    primary: "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white",
    text: "text-rose-600",
    border: "border-rose-600",
    accent: "rose",
    gradient: "from-rose-500 to-pink-600",
    focus: "focus:ring-rose-500",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
  }
};
