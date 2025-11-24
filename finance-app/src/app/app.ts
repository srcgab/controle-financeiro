import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth';
import { SalarySchedulerService } from './services/salary-scheduler.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html'
})
export class App implements OnInit, OnDestroy {
  isLogged = false;
  
  constructor(
    private auth: AuthService, 
    private router: Router,
    private salaryScheduler: SalarySchedulerService
  ) {
    this.auth.currentUser$.subscribe(u => {
      this.isLogged = !!u;
      
      if (u) {
        // Iniciar o scheduler quando o usuário fizer login
        this.salaryScheduler.startScheduler();
      } else {
        // Parar o scheduler quando o usuário fizer logout
        this.salaryScheduler.stopScheduler();
      }
    });
  }

  ngOnInit(): void {
    // Se já estiver logado ao iniciar o app
    if (this.auth.isAuthenticated()) {
      this.salaryScheduler.startScheduler();
    }
  }

  ngOnDestroy(): void {
    this.salaryScheduler.stopScheduler();
  }

  logout() {
    this.auth.logout();
  }
}