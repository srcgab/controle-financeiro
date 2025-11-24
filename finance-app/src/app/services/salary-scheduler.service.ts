import { Injectable } from '@angular/core';
import { AuthService } from './auth';
import { TransactionService } from './transaction.service';

@Injectable({
  providedIn: 'root'
})
export class SalarySchedulerService {
  private checkInterval: any;

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService
  ) {}

  startScheduler(): void {
    // Verificar a cada 1 minuto (para testes - em produção usar 60 * 60 * 1000 para 1 hora)
    this.checkInterval = setInterval(() => {
      this.checkAndAddSalary();
    }, 60 * 1000); // 1 minuto
    
    // Executar verificação imediata ao iniciar
    this.checkAndAddSalary();
  }

  stopScheduler(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  checkAndAddSalaryNow(): void {
    this.checkAndAddSalary();
  }

  private checkAndAddSalary(): void {
    const user = this.authService.getCurrentUser();
    
    if (!user || !user.salaryAutoAddEnabled || !user.monthlyIncome || user.monthlyIncome <= 0) {
      return;
    }

    if (!user.salaryAutoAddDay || user.salaryAutoAddDay < 1 || user.salaryAutoAddDay > 31) {
      return;
    }

    const today = new Date();
    const dayOfMonth = today.getDate();

    if (dayOfMonth !== user.salaryAutoAddDay) {
      return;
    }

    if (user.lastSalaryAddDate) {
      const lastAddDate = new Date(user.lastSalaryAddDate);
      if (lastAddDate.getMonth() === today.getMonth() && 
          lastAddDate.getFullYear() === today.getFullYear()) {
        return;
      }
    }

    this.addSalaryAutomatically(user);
  }

  private addSalaryAutomatically(user: any): void {
    const transaction = {
      userId: user.id,
      type: 'income' as const,
      amount: user.monthlyIncome,
      category: 'Salário',
      description: 'Salário mensal (adicionado automaticamente)',
      date: new Date(),
      createdAt: new Date().toISOString()
    };

    this.transactionService.createTransaction(transaction).subscribe({
      next: () => {
        const today = new Date().toISOString().split('T')[0];
        this.authService.updateUser(user.id, { lastSalaryAddDate: today }).subscribe({
          next: () => {
            console.log('Salário adicionado automaticamente com sucesso!');
          },
          error: (err) => {
            console.error('Erro ao atualizar data do último salário:', err);
          }
        });
      },
      error: (err) => {
        console.error('Erro ao adicionar salário automaticamente:', err);
      }
    });
  }
}
