import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DashboardSummary } from '../models/dashboard.model';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private mockTransactions: Transaction[] = [
    {
      id: 1,
      type: 'income',
      amount: 5000,
      date: new Date(2024, 10, 5),
      category: 'Salário',
      description: 'Salário mensal'
    },
    {
      id: 2,
      type: 'income',
      amount: 1500,
      date: new Date(2024, 10, 10),
      category: 'Freelance',
      description: 'Projeto web'
    },
    {
      id: 3,
      type: 'expense',
      amount: 1200,
      date: new Date(2024, 10, 8),
      category: 'Aluguel',
      description: 'Aluguel mensal'
    },
    {
      id: 4,
      type: 'expense',
      amount: 450,
      date: new Date(2024, 10, 12),
      category: 'Alimentação',
      description: 'Supermercado'
    },
    {
      id: 5,
      type: 'expense',
      amount: 300,
      date: new Date(2024, 10, 15),
      category: 'Transporte',
      description: 'Combustível e manutenção'
    }
  ];

  private currentPeriod = 'Este mês';
  private financialGoalSubject = new BehaviorSubject({
    targetAmount: 10000,
    currentAmount: 5000,
    progressPercentage: 50.0
  });

  financialGoal$ = this.financialGoalSubject.asObservable();

  constructor() {}

  getDashboardSummary(period: string = 'Este mês'): Observable<DashboardSummary> {
    this.currentPeriod = period;
    
    const filteredTransactions = this.filterTransactionsByPeriod(period);
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentBalance = -100;

    const summary: DashboardSummary = {
      currentBalance,
      totalIncome,
      totalExpense,
      period,
      financialGoal: this.financialGoalSubject.getValue()
    };

    return of(summary).pipe(delay(300));
  }

  updateFinancialGoal(targetAmount: number): Observable<boolean> {
    const current = this.financialGoalSubject.getValue();
    const progressPercentage = (current.currentAmount / targetAmount) * 100;
    
    this.financialGoalSubject.next({
      targetAmount,
      currentAmount: current.currentAmount,
      progressPercentage
    });

    return of(true).pipe(delay(200));
  }

  private filterTransactionsByPeriod(period: string): Transaction[] {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (period) {
      case 'Este mês':
        return this.mockTransactions.filter(t => {
          const transDate = new Date(t.date);
          return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
        });
      
      case 'Esta semana':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return this.mockTransactions.filter(t => new Date(t.date) >= oneWeekAgo);
      
      case 'Últimos 3 meses':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return this.mockTransactions.filter(t => new Date(t.date) >= threeMonthsAgo);
      
      default:
        return this.mockTransactions;
    }
  }

  getTransactions(): Transaction[] {
    return [...this.mockTransactions];
  }

  addTransaction(transaction: Transaction): Observable<Transaction> {
    const newTransaction = {
      ...transaction,
      id: this.mockTransactions.length + 1
    };
    this.mockTransactions.push(newTransaction);
    
    // Recalculate financial goal progress
    const goal = this.financialGoalSubject.getValue();
    const currentAmount = this.mockTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) - 
      this.mockTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.financialGoalSubject.next({
      ...goal,
      currentAmount,
      progressPercentage: (currentAmount / goal.targetAmount) * 100
    });

    return of(newTransaction).pipe(delay(300));
  }
}
