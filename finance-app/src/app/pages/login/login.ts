import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, FormsModule]
})
export class Login {
  isRegistering = false;
  isLoading = false;

  loginEmail = '';
  loginSenha = '';

  cadastroNome = '';
  cadastroEmail = '';
  cadastroSenha = '';

  feedback = '';

  constructor(private auth: AuthService, private router: Router) { }

  onLogin(e: Event) {
    e.preventDefault();
    this.feedback = '';
    this.isLoading = true;
    
    this.auth.login(this.loginEmail.trim(), this.loginSenha).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (!res.success) {
          this.feedback = res.message || 'Erro ao logar';
          return;
        }
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.feedback = err.message || 'Erro ao fazer login';
      }
    });
  }

  onRegister(e: Event) {
    e.preventDefault();
    this.feedback = '';
    this.isLoading = true;
    
    this.auth.register(this.cadastroNome.trim(), this.cadastroEmail.trim(), this.cadastroSenha).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (!res.success) {
          this.feedback = res.message || 'Erro ao registrar';
          return;
        }
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.feedback = err.message || 'Erro ao registrar usuário';
      }
    });
  }

  toggle(mode: boolean) {
    this.isRegistering = mode;
    this.feedback = '';
  }
}
