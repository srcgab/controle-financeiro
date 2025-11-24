import { Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  validateEmail, 
  validatePasswordStrength, 
  validateName,
  sanitizeInput 
} from '../../utils/security.util';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, FormsModule]
})
export class Login implements OnDestroy {
  isRegistering = false;
  isLoading = false;

  loginEmail = '';
  loginSenha = '';
  loginErrors: string[] = [];

  cadastroNome = '';
  cadastroEmail = '';
  cadastroSenha = '';
  cadastroSenhaConfirm = '';
  registerErrors: string[] = [];

  feedback = '';
  feedbackType: 'success' | 'error' | 'info' = 'error';

  private returnUrl: string = '/home';

  constructor(
    private auth: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  ngOnDestroy(): void {
  }

  validateLoginFields(): boolean {
    this.loginErrors = [];
    
    const email = this.loginEmail.trim();
    const senha = this.loginSenha;

    if (!email) {
      this.loginErrors.push('Email é obrigatório');
    } else if (!validateEmail(email)) {
      this.loginErrors.push('Email inválido');
    }

    if (!senha) {
      this.loginErrors.push('Senha é obrigatória');
    }

    return this.loginErrors.length === 0;
  }

  validateRegisterFields(): boolean {
    this.registerErrors = [];
    
    const nome = this.cadastroNome.trim();
    const email = this.cadastroEmail.trim();
    const senha = this.cadastroSenha;
    const senhaConfirm = this.cadastroSenhaConfirm;

    const nameErrors = validateName(nome);
    if (nameErrors.length > 0) {
      this.registerErrors.push(...nameErrors);
    }

    if (!email) {
      this.registerErrors.push('Email é obrigatório');
    } else if (!validateEmail(email)) {
      this.registerErrors.push('Email inválido');
    }

    if (!senha) {
      this.registerErrors.push('Senha é obrigatória');
    } else {
      const passwordErrors = validatePasswordStrength(senha);
      if (passwordErrors.length > 0) {
        this.registerErrors.push(...passwordErrors);
      }
    }

    if (!senhaConfirm) {
      this.registerErrors.push('Confirmação de senha é obrigatória');
    } else if (senha !== senhaConfirm) {
      this.registerErrors.push('As senhas não coincidem');
    }

    return this.registerErrors.length === 0;
  }

  onLogin(e: Event): void {
    e.preventDefault();
    
    this.feedback = '';
    this.loginErrors = [];

    if (!this.validateLoginFields()) {
      this.feedback = this.loginErrors.join('. ');
      this.feedbackType = 'error';
      return;
    }

    this.isLoading = true;
    
    const email = sanitizeInput(this.loginEmail.trim());
    const senha = this.loginSenha;

    this.auth.login(email, senha).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        if (!res.success) {
          this.feedback = res.message || 'Erro ao fazer login';
          this.feedbackType = 'error';
          return;
        }
        
        this.feedback = res.message || 'Login realizado com sucesso!';
        this.feedbackType = 'success';
        
        this.loginEmail = '';
        this.loginSenha = '';
        
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 500);
      },
      error: (err) => {
        this.isLoading = false;
        this.feedback = err.message || 'Erro ao fazer login. Tente novamente.';
        this.feedbackType = 'error';
        console.error('Erro no login:', err);
      }
    });
  }

  onRegister(e: Event): void {
    e.preventDefault();
    
    this.feedback = '';
    this.registerErrors = [];

    if (!this.validateRegisterFields()) {
      this.feedback = this.registerErrors.join('. ');
      this.feedbackType = 'error';
      return;
    }

    this.isLoading = true;
    
    const nome = sanitizeInput(this.cadastroNome.trim());
    const email = sanitizeInput(this.cadastroEmail.trim());
    const senha = this.cadastroSenha;

    this.auth.register(nome, email, senha).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        if (!res.success) {
          this.feedback = res.message || 'Erro ao registrar';
          this.feedbackType = 'error';
          return;
        }
        
        this.feedback = res.message || 'Cadastro realizado com sucesso!';
        this.feedbackType = 'success';
        
        this.cadastroNome = '';
        this.cadastroEmail = '';
        this.cadastroSenha = '';
        this.cadastroSenhaConfirm = '';
        
        setTimeout(() => {
          this.router.navigate(['/profile'], { 
            queryParams: { newUser: 'true' } 
          });
        }, 500);
      },
      error: (err) => {
        this.isLoading = false;
        this.feedback = err.message || 'Erro ao registrar usuário. Tente novamente.';
        this.feedbackType = 'error';
        console.error('Erro no registro:', err);
      }
    });
  }

  toggle(mode: boolean): void {
    this.isRegistering = mode;
    this.feedback = '';
    this.loginErrors = [];
    this.registerErrors = [];
    
    if (mode) {
      this.loginEmail = '';
      this.loginSenha = '';
    } else {
      this.cadastroNome = '';
      this.cadastroEmail = '';
      this.cadastroSenha = '';
      this.cadastroSenhaConfirm = '';
    }
  }

  togglePasswordVisibility(field: 'login' | 'register'): void {
  }
}
