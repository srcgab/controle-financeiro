import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { DashboardService } from '../../services/dashboard.service';
import { TransactionService } from '../../services/transaction.service';
import { DashboardSummary } from '../../models/dashboard.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  userName = '';
  dashboardData: DashboardSummary | null = null;
  selectedPeriod = 'Este mês';
  periods = ['Este mês', 'Esta semana', 'Últimos 3 meses'];
  isEditingGoal = false;
  newGoalAmount: number = 0;
  newGoalName: string = '';
  isLoading = false;
  isAddingSalary = false;
  isAddingReserve = false;
  reserveAmount: number = 0;

  constructor(
    private auth: AuthService,
    private dashboardService: DashboardService,
    private transactionService: TransactionService,
    private router: Router
  ) {
    const u = this.auth.getCurrentUser();
    this.userName = u ? u.name : 'Usuário';
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardSummary(this.selectedPeriod).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dashboard:', err);
        this.isLoading = false;
      }
    });
  }

  onPeriodChange(): void {
    this.loadDashboard();
  }

  openEditGoal(): void {
    if (this.dashboardData?.financialGoal) {
      this.newGoalAmount = this.dashboardData.financialGoal.targetAmount;
      this.newGoalName = this.dashboardData.financialGoal.goalName;
      this.isEditingGoal = true;
    }
  }

  saveGoal(): void {
    if (this.newGoalAmount > 0) {
      this.dashboardService.updateFinancialGoal(this.newGoalAmount, this.newGoalName).subscribe({
        next: () => {
          this.isEditingGoal = false;
          this.loadDashboard();
        }
      });
    }
  }

  cancelEditGoal(): void {
    this.isEditingGoal = false;
  }

  addReserveToGoal(): void {
    if (this.reserveAmount <= 0) {
      return;
    }

    this.isAddingReserve = true;
    this.dashboardService.addReservedAmount(this.reserveAmount).subscribe({
      next: () => {
        this.isAddingReserve = false;
        this.reserveAmount = 0;
        this.loadDashboard();
      },
      error: (err) => {
        this.isAddingReserve = false;
        console.error('Erro ao adicionar valor reservado:', err);
      }
    });
  }

  addSalaryToIncome(): void {
    const user = this.auth.getCurrentUser();
    if (!user || !user.monthlyIncome || user.monthlyIncome <= 0) {
      return;
    }

    this.isAddingSalary = true;
    
    const transaction = {
      userId: user.id,
      type: 'income' as const,
      amount: user.monthlyIncome,
      category: 'Salário',
      description: 'Salário mensal',
      date: new Date(),
      createdAt: new Date().toISOString()
    };

    this.transactionService.createTransaction(transaction).subscribe({
      next: () => {
        this.isAddingSalary = false;
        const today = new Date().toISOString().split('T')[0];
        this.auth.updateUser(user.id, { lastSalaryAddDate: today }).subscribe();
        this.loadDashboard();
      },
      error: (err) => {
        this.isAddingSalary = false;
        console.error('Erro ao adicionar salário:', err);
      }
    });
  }

  canAddSalary(): boolean {
    const user = this.auth.getCurrentUser();
    if (!user || !user.monthlyIncome || user.monthlyIncome <= 0) {
      return false;
    }

    if (!user.lastSalaryAddDate) {
      return true;
    }

    const lastAddDate = new Date(user.lastSalaryAddDate);
    const today = new Date();
    
    return lastAddDate.getMonth() !== today.getMonth() || 
           lastAddDate.getFullYear() !== today.getFullYear();
  }

  showSalaryButton(): boolean {
    const user = this.auth.getCurrentUser();
    return !user?.salaryAutoAddEnabled;
  }

  navigateToAddIncome(): void {
    this.router.navigate(['/transactions'], { queryParams: { type: 'income' } });
  }

  navigateToAddExpense(): void {
    this.router.navigate(['/transactions'], { queryParams: { type: 'expense' } });
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  getBalanceStatus(): string {
    if (!this.dashboardData) return 'neutral';
    if (this.dashboardData.currentBalance > 0) return 'positive';
    if (this.dashboardData.currentBalance < 0) return 'negative';
    return 'neutral';
  }

  getGoalStatusText(): string {
    if (!this.dashboardData?.financialGoal) return '';
    const progress = this.dashboardData.financialGoal.progressPercentage;
    if (progress >= 80) return 'Excelente!';
    if (progress >= 50) return 'Bom progresso';
    if (progress >= 25) return 'Continue assim';
    return 'Você consegue!';
  }

  logout(): void {
    this.auth.logout();
  }
}