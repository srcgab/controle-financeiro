import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-developers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './developers.html',
  styleUrl: './developers.css'
})
export class Developers {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/home']);
  }

  sendEmail(email: string): void {
    window.open(`mailto:${email}`, '_blank');
  }

  openGitHub(): void {
    window.open('https://github.com/srcgab/controle-financeiro', '_blank');
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('pt-BR');
  }
}