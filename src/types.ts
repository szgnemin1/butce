export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  installmentId?: string; // Optional reference to an installment
  isRecurring?: boolean; // Weekly/Monthly etc
  paymentMethod?: string; // e.g. 'Nakit', 'Kredi Kartı', 'Banka Kartı'
}

export interface Installment {
  id: string;
  title: string;
  totalAmount: number;
  category: string;
  totalInstallments: number;
  currentInstallment: number;
  monthlyAmount: number;
  startDate: string; // YYYY-MM-DD
  description?: string;
}

export interface BudgetGoal {
  id: string;
  category: string;
  limitAmount: number;
  spentAmount: number;
  month: string; // YYYY-MM
}

export interface Reminder {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: string; // YYYY-MM-DD
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isActive: boolean;
}

export interface AppSettings {
  themeColor: 'zinc' | 'blue' | 'emerald' | 'amber' | 'violet' | 'rose';
  isDark: boolean;
  passwordHash: string; // SHA-256 hash, default is "1234"'s hash
  lastBackupDate?: string;
}

export interface DatabaseState {
  transactions: Transaction[];
  installments: Installment[];
  goals: BudgetGoal[];
  reminders: Reminder[];
  settings: AppSettings;
}
