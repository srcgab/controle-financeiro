export interface DashboardSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  period: string;
  financialGoal?: FinancialGoal;
}

export interface FinancialGoal {
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
}
