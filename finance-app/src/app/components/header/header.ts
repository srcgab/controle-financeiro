import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showBackButton: boolean = false;
  @Input() backRoute: string = '/home';

  currentUser: any = null;
  userName = '';
  isMobileMenuOpen = false;

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

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }

  goBack() {
    this.router.navigate([this.backRoute]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeMobileMenu();
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}