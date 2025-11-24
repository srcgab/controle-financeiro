export interface DashboardSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyIncome?: number;
  period: string;
  financialGoal?: FinancialGoal;
}

export interface FinancialGoal {
  targetAmount: number;
  currentAmount: number;
  reservedAmount?: number;
  goalName: string;
  progressPercentage: number;
}
