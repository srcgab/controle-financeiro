import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  isOpen = false;
  currentUser: any = null;
  userName = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  loadUserInfo() {
    this.currentUser = this.authService.getCurrentUser();
    this.userName = this.currentUser?.name || 'Usuário';
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  closeSidebar() {
    this.isOpen = false;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeSidebar();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeSidebar();
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}