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

  loginEmail = '';
  loginSenha = '';

  cadastroNome = '';
  cadastroEmail = '';
  cadastroSenha = '';

  feedback = '';

  constructor(private auth: AuthService, private router: Router) { }

  onLogin(e: Event) {
    e.preventDefault();
    const res = this.auth.login(this.loginEmail.trim(), this.loginSenha);
    if (!res.success) {
      this.feedback = res.message || 'Erro ao logar';
      return;
    }
    this.feedback = '';
    this.router.navigate(['/home']);
  }

  onRegister(e: Event) {
    e.preventDefault();
    const res = this.auth.register(this.cadastroNome.trim(), this.cadastroEmail.trim(), this.cadastroSenha);
    if (!res.success) {
      this.feedback = res.message || 'Erro ao registrar';
      return;
    }
    this.feedback = '';
    this.router.navigate(['/home']);
  }

  toggle(mode: boolean) {
    this.isRegistering = mode;
    this.feedback = '';
  }
}
