import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DashboardSummary } from '../models/dashboard.model';
import { TransactionService } from './transaction.service';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

interface Goal {
  id: number;
  userId: number;
  targetAmount: number;
  currentAmount: number;
  reservedAmount?: number;
  goalName: string;
  description: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/goals`;
  private financialGoalSubject = new BehaviorSubject({
    targetAmount: 10000,
    currentAmount: 0,
    reservedAmount: 0,
    goalName: 'Meta de Economia',
    progressPercentage: 0
  });

  financialGoal$ = this.financialGoalSubject.asObservable();

  constructor(
    private http: HttpClient,
    private transactionService: TransactionService,
    private authService: AuthService
  ) {
    this.loadFinancialGoal();
  }

  private loadFinancialGoal(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.http.get<Goal[]>(`${this.apiUrl}?userId=${currentUser.id}`).subscribe({
      next: (goals) => {
        if (goals.length > 0) {
          const goal = goals[0];
          this.financialGoalSubject.next({
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            reservedAmount: goal.reservedAmount || 0,
            goalName: goal.goalName || 'Meta de Economia',
            progressPercentage: (goal.currentAmount / goal.targetAmount) * 100
          });
        }
      },
      error: (err) => console.error('Erro ao carregar meta financeira:', err)
    });
  }

  getDashboardSummary(period: string = 'Este mês'): Observable<DashboardSummary> {
    const dateRange = this.getDateRangeByPeriod(period);
    const currentUser = this.authService.getCurrentUser();
    
    return forkJoin({
      income: this.transactionService.getTotalIncome(dateRange.start, dateRange.end),
      expense: this.transactionService.getTotalExpenses(dateRange.start, dateRange.end),
      balance: this.transactionService.getBalance(dateRange.start, dateRange.end)
    }).pipe(
      map(result => ({
        currentBalance: result.balance,
        totalIncome: result.income,
        totalExpense: result.expense,
        monthlyIncome: currentUser?.monthlyIncome || 0,
        period,
        financialGoal: this.financialGoalSubject.getValue()
      }))
    );
  }

  updateFinancialGoal(targetAmount: number, goalName?: string): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    return this.http.get<Goal[]>(`${this.apiUrl}?userId=${currentUser.id}`).pipe(
      map(goals => {
        const current = this.financialGoalSubject.getValue();
        const progressPercentage = (current.currentAmount / targetAmount) * 100;
        
        const updatedGoal = {
          targetAmount,
          currentAmount: current.currentAmount,
          reservedAmount: current.reservedAmount || 0,
          goalName: goalName || current.goalName,
          progressPercentage
        };

        if (goals.length > 0) {
          const updateData: any = {
            targetAmount,
            currentAmount: current.currentAmount,
            reservedAmount: current.reservedAmount || 0
          };
          if (goalName) {
            updateData.goalName = goalName;
          }
          
          this.http.patch(`${this.apiUrl}/${goals[0].id}`, updateData).subscribe();
        } else {
          this.http.post(this.apiUrl, {
            userId: currentUser.id,
            targetAmount,
            currentAmount: current.currentAmount,
            reservedAmount: 0,
            goalName: goalName || 'Meta de Economia',
            description: 'Meta de economia',
            createdAt: new Date().toISOString()
          }).subscribe();
        }

        this.financialGoalSubject.next(updatedGoal);
        return true;
      })
    );
  }

  addReservedAmount(amount: number): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    return this.http.get<Goal[]>(`${this.apiUrl}?userId=${currentUser.id}`).pipe(
      map(goals => {
        if (goals.length === 0) {
          throw new Error('Nenhuma meta financeira encontrada');
        }

        const goal = goals[0];
        const current = this.financialGoalSubject.getValue();
        const newReservedAmount = (current.reservedAmount || 0) + amount;
        const newCurrentAmount = current.currentAmount + amount;
        const progressPercentage = (newCurrentAmount / current.targetAmount) * 100;

        const updatedGoal = {
          targetAmount: current.targetAmount,
          currentAmount: newCurrentAmount,
          reservedAmount: newReservedAmount,
          goalName: current.goalName,
          progressPercentage
        };

        // Create an expense transaction for the reserved amount
        const reserveTransaction = {
          userId: currentUser.id,
          type: 'expense' as const,
          amount: amount,
          category: 'Reserva Meta',
          description: `Valor reservado para: ${current.goalName}`,
          date: new Date(),
          createdAt: new Date().toISOString()
        };

        // Update goal and create transaction
        this.http.patch(`${this.apiUrl}/${goal.id}`, {
          currentAmount: newCurrentAmount,
          reservedAmount: newReservedAmount
        }).subscribe();

        this.transactionService.createTransaction(reserveTransaction).subscribe();

        this.financialGoalSubject.next(updatedGoal);
        return true;
      })
    );
  }

  private getDateRangeByPeriod(period: string): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start: Date;

    switch (period) {
      case 'Este mês':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      
      case 'Esta semana':
        start = new Date();
        start.setDate(now.getDate() - 7);
        break;
      
      case 'Últimos 3 meses':
        start = new Date();
        start.setMonth(now.getMonth() - 3);
        break;
      
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { start, end };
  }
}
