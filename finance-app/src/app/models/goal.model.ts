export interface FinancialGoal {
  id: number;
  targetAmount: number;
  currentAmount: number;
  reservedAmount?: number;
  goalName: string;
  month: string;
  year: number;
}
