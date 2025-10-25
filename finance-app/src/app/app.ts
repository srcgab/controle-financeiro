import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html'
})
export class App {
  isLogged = false;
  constructor(private auth: AuthService, private router: Router) {
    this.auth.currentUser$.subscribe(u => this.isLogged = !!u);
  }

  logout() {
    this.auth.logout();
  }
}