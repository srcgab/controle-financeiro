import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { DashboardService } from '../../services/dashboard.service';
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
  isLoading = false;

  constructor(
    private auth: AuthService,
    private dashboardService: DashboardService,
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
      this.isEditingGoal = true;
    }
  }

  saveGoal(): void {
    if (this.newGoalAmount > 0) {
      this.dashboardService.updateFinancialGoal(this.newGoalAmount).subscribe({
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

  navigateToAddIncome(): void {
    this.router.navigate(['/transactions'], { queryParams: { type: 'income' } });
  }

  navigateToAddExpense(): void {
    this.router.navigate(['/transactions'], { queryParams: { type: 'expense' } });
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