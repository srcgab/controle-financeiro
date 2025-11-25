import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth';
import { SalarySchedulerService } from './services/salary-scheduler.service';
import { Header } from './components/header/header';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, Header],
  templateUrl: './app.html'
})
export class App implements OnInit, OnDestroy {
  isLogged = false;
  showHeader = false;
  
  constructor(
    private auth: AuthService, 
    private router: Router,
    private salaryScheduler: SalarySchedulerService
  ) {
    this.auth.currentUser$.subscribe(u => {
      this.isLogged = !!u;
      this.updateHeaderVisibility();
      
      if (u) {
        // Iniciar o scheduler quando o usuário fizer login
        this.salaryScheduler.startScheduler();
      } else {
        // Parar o scheduler quando o usuário fizer logout
        this.salaryScheduler.stopScheduler();
      }
    });

    // Listen to route changes to update header visibility
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateHeaderVisibility();
    });
  }

  ngOnInit(): void {
    // Se já estiver logado ao iniciar o app
    if (this.auth.isAuthenticated()) {
      this.salaryScheduler.startScheduler();
    }
    this.updateHeaderVisibility();
  }

  ngOnDestroy(): void {
    this.salaryScheduler.stopScheduler();
  }

  private updateHeaderVisibility() {
    // Show header only when user is logged and not on login page
    this.showHeader = this.isLogged && this.router.url !== '/login';
  }

  logout() {
    this.auth.logout();
  }
}