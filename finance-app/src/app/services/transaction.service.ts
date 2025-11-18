import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Transaction } from '../models/transaction.model';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  addTransaction(transaction: Omit<Transaction, 'id'>): Observable<Transaction> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('Usuário não autenticado'));
    }

    if (!transaction.amount || transaction.amount <= 0) {
      return throwError(() => new Error('Valor inválido'));
    }

    if (!transaction.date) {
      return throwError(() => new Error('Data é obrigatória'));
    }

    if (!transaction.category) {
      return throwError(() => new Error('Categoria é obrigatória'));
    }

    const newTransaction = {
      ...transaction,
      userId: currentUser.id,
      date: typeof transaction.date === 'string' ? transaction.date : transaction.date.toISOString().split('T')[0]
    };

    return this.http.post<Transaction>(this.apiUrl, newTransaction);
  }

  getTransactions(filter?: {
    type?: 'income' | 'expense';
    startDate?: Date;
    endDate?: Date;
    category?: string;
  }): Observable<Transaction[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('Usuário não autenticado'));
    }

    let params = new HttpParams().set('userId', currentUser.id.toString());

    if (filter?.type) {
      params = params.set('type', filter.type);
    }

    if (filter?.category) {
      params = params.set('category', filter.category);
    }

    return this.http.get<Transaction[]>(this.apiUrl, { params }).pipe(
      map(transactions => {
        let filtered = transactions;

        if (filter?.startDate) {
          filtered = filtered.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= filter.startDate!;
          });
        }

        if (filter?.endDate) {
          filtered = filtered.filter(t => {
            const tDate = new Date(t.date);
            return tDate <= filter.endDate!;
          });
        }

        return filtered.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });
      })
    );
  }

  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  updateTransaction(id: number, updates: Partial<Transaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/${id}`, updates);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTotalIncome(startDate?: Date, endDate?: Date): Observable<number> {
    return this.getTransactions({
      type: 'income',
      startDate,
      endDate
    }).pipe(
      map(transactions => transactions.reduce((sum, t) => sum + t.amount, 0))
    );
  }

  getTotalExpenses(startDate?: Date, endDate?: Date): Observable<number> {
    return this.getTransactions({
      type: 'expense',
      startDate,
      endDate
    }).pipe(
      map(transactions => transactions.reduce((sum, t) => sum + t.amount, 0))
    );
  }

  getBalance(startDate?: Date, endDate?: Date): Observable<number> {
    return this.getTransactions({ startDate, endDate }).pipe(
      map(transactions => {
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        return income - expenses;
      })
    );
  }
}
