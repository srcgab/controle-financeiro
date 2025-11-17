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
            progressPercentage: (goal.currentAmount / goal.targetAmount) * 100
          });
        }
      },
      error: (err) => console.error('Erro ao carregar meta financeira:', err)
    });
  }

  getDashboardSummary(period: string = 'Este mês'): Observable<DashboardSummary> {
    const dateRange = this.getDateRangeByPeriod(period);
    
    return forkJoin({
      income: this.transactionService.getTotalIncome(dateRange.start, dateRange.end),
      expense: this.transactionService.getTotalExpenses(dateRange.start, dateRange.end),
      balance: this.transactionService.getBalance(dateRange.start, dateRange.end)
    }).pipe(
      map(result => ({
        currentBalance: result.balance,
        totalIncome: result.income,
        totalExpense: result.expense,
        period,
        financialGoal: this.financialGoalSubject.getValue()
      }))
    );
  }

  updateFinancialGoal(targetAmount: number): Observable<boolean> {
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
          progressPercentage
        };

        if (goals.length > 0) {
          // Atualiza meta existente
          this.http.patch(`${this.apiUrl}/${goals[0].id}`, {
            targetAmount,
            currentAmount: current.currentAmount
          }).subscribe();
        } else {
          // Cria nova meta
          this.http.post(this.apiUrl, {
            userId: currentUser.id,
            targetAmount,
            currentAmount: current.currentAmount,
            description: 'Meta de economia',
            createdAt: new Date().toISOString()
          }).subscribe();
        }

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
