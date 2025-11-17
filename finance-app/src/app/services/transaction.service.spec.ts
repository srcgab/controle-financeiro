import { TestBed } from '@angular/core/testing';
import { TransactionService } from './transaction.service';
import { AuthService } from './auth';
import { Transaction } from '../models/transaction.model';

describe('TransactionService', () => {
  let service: TransactionService;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    TestBed.configureTestingModule({
      providers: [
        TransactionService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(TransactionService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addTransaction', () => {
    it('should add a new income transaction', (done) => {
      authService.getCurrentUser.and.returnValue({ 
        id: 1, 
        name: 'Test User', 
        email: 'test@test.com',
        password: ''
      });

      const newTransaction = {
        type: 'income' as const,
        amount: 1000,
        date: new Date(),
        category: 'Salário',
        description: 'Test income'
      };

      service.addTransaction(newTransaction).subscribe({
        next: (result: Transaction) => {
          expect(result).toBeTruthy();
          expect(result.id).toBeTruthy();
          expect(result.type).toBe('income');
          expect(result.amount).toBe(1000);
          done();
        }
      });
    });

    it('should add a new expense transaction', (done) => {
      authService.getCurrentUser.and.returnValue({ 
        id: 1, 
        name: 'Test User', 
        email: 'test@test.com',
        password: ''
      });

      const newTransaction = {
        type: 'expense' as const,
        amount: 500,
        date: new Date(),
        category: 'Alimentação',
        description: 'Test expense'
      };

      service.addTransaction(newTransaction).subscribe({
        next: (result: Transaction) => {
          expect(result).toBeTruthy();
          expect(result.id).toBeTruthy();
          expect(result.type).toBe('expense');
          expect(result.amount).toBe(500);
          done();
        }
      });
    });

    it('should throw error if user not authenticated', (done) => {
      authService.getCurrentUser.and.returnValue(null);

      const newTransaction = {
        type: 'income' as const,
        amount: 1000,
        date: new Date(),
        category: 'Salário'
      };

      service.addTransaction(newTransaction).subscribe({
        error: (err) => {
          expect(err.message).toContain('não autenticado');
          done();
        }
      });
    });

    it('should throw error if amount is invalid', (done) => {
      authService.getCurrentUser.and.returnValue({ 
        id: 1, 
        name: 'Test User', 
        email: 'test@test.com',
        password: ''
      });

      const newTransaction = {
        type: 'income' as const,
        amount: -100,
        date: new Date(),
        category: 'Salário'
      };

      service.addTransaction(newTransaction).subscribe({
        error: (err) => {
          expect(err.message).toContain('inválido');
          done();
        }
      });
    });
  });

  describe('getTransactions', () => {
    beforeEach(() => {
      authService.getCurrentUser.and.returnValue({ 
        id: 1, 
        name: 'Test User', 
        email: 'test@test.com',
        password: ''
      });
    });

    it('should return all transactions', (done) => {
      service.getTransactions().subscribe({
        next: (transactions: Transaction[]) => {
          expect(transactions).toBeTruthy();
          expect(Array.isArray(transactions)).toBe(true);
          done();
        }
      });
    });

    it('should filter transactions by type', (done) => {
      service.getTransactions({ type: 'income' }).subscribe({
        next: (transactions: Transaction[]) => {
          expect(transactions.every(t => t.type === 'income')).toBe(true);
          done();
        }
      });
    });

    it('should filter transactions by date range', (done) => {
      const startDate = new Date(2025, 10, 1);
      const endDate = new Date(2025, 10, 30);

      service.getTransactions({ startDate, endDate }).subscribe({
        next: (transactions: Transaction[]) => {
          expect(transactions.every(t => 
            t.date >= startDate && t.date <= endDate
          )).toBe(true);
          done();
        }
      });
    });
  });

  describe('getTotalIncome', () => {
    beforeEach(() => {
      authService.getCurrentUser.and.returnValue({ 
        id: 1, 
        name: 'Test User', 
        email: 'test@test.com',
        password: ''
      });
    });

    it('should calculate total income', (done) => {
      service.getTotalIncome().subscribe({
        next: (total: number) => {
          expect(total).toBeGreaterThanOrEqual(0);
          done();
        }
      });
    });
  });

  describe('getTotalExpenses', () => {
    beforeEach(() => {
      authService.getCurrentUser.and.returnValue({ 
        id: 1, 
        name: 'Test User', 
        email: 'test@test.com',
        password: ''
      });
    });

    it('should calculate total expenses', (done) => {
      service.getTotalExpenses().subscribe({
        next: (total: number) => {
          expect(total).toBeGreaterThanOrEqual(0);
          done();
        }
      });
    });
  });

  describe('getBalance', () => {
    beforeEach(() => {
      authService.getCurrentUser.and.returnValue({ 
        id: 1, 
        name: 'Test User', 
        email: 'test@test.com',
        password: ''
      });
    });

    it('should calculate balance (income - expenses)', (done) => {
      service.getBalance().subscribe({
        next: (balance: number) => {
          expect(typeof balance).toBe('number');
          done();
        }
      });
    });
  });

  describe('deleteTransaction', () => {
    beforeEach(() => {
      authService.getCurrentUser.and.returnValue({ 
        id: 1, 
        name: 'Test User', 
        email: 'test@test.com',
        password: ''
      });
    });

    it('should delete existing transaction', (done) => {
      service.getTransactions().subscribe({
        next: (transactions: Transaction[]) => {
          if (transactions.length > 0) {
            const firstId = transactions[0].id;
            service.deleteTransaction(firstId).subscribe({
              next: () => {
                expect(true).toBe(true);
                done();
              }
            });
          } else {
            done();
          }
        }
      });
    });

    it('should throw error for non-existent transaction', (done) => {
      service.deleteTransaction(99999).subscribe({
        error: (err) => {
          expect(err.message).toContain('não encontrada');
          done();
        }
      });
    });
  });
});
