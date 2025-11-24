import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap, delay, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { 
  User, 
  UserPublic, 
  AuthResponse, 
  AuthSession,
  LoginRequest, 
  RegisterRequest 
} from '../models/auth.model';
import {
  hashPassword,
  validateEmail,
  validatePasswordStrength,
  validateName,
  sanitizeInput,
  generateSessionToken,
  createExpirationTime,
  isExpired,
  isValidToken
} from '../utils/security.util';

export type { UserPublic as User, AuthResponse };

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private sessionsUrl = `${environment.apiUrl}/sessions`;
  private currentUserSubject = new BehaviorSubject<UserPublic | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private sessionCheckInterval: any;
  
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000;
  
  currentUser$ = this.currentUserSubject.asObservable();
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.initializeSession();
    this.startSessionCheck();
  }

  private initializeSession(): void {
    try {
      const sessionData = localStorage.getItem('auth_session');
      if (!sessionData) return;

      const session: AuthSession = JSON.parse(sessionData);
      
      if (!this.isValidSession(session)) {
        this.clearSession();
        return;
      }

      const userData = localStorage.getItem('current_user');
      if (userData) {
        const user: UserPublic = JSON.parse(userData);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      } else {
        this.clearSession();
      }
    } catch (error) {
      console.error('Erro ao inicializar sessão:', error);
      this.clearSession();
    }
  }

  private isValidSession(session: AuthSession): boolean {
    if (!session || !session.token || !session.expiresAt) return false;
    if (!isValidToken(session.token)) return false;
    if (isExpired(session.expiresAt)) return false;
    return true;
  }

  private startSessionCheck(): void {
    this.sessionCheckInterval = setInterval(() => {
      const sessionData = localStorage.getItem('auth_session');
      if (!sessionData) {
        this.logout();
        return;
      }

      try {
        const session: AuthSession = JSON.parse(sessionData);
        if (!this.isValidSession(session)) {
          this.logout();
        }
      } catch {
        this.logout();
      }
    }, 5 * 60 * 1000);
  }

  private clearSession(): void {
    localStorage.removeItem('auth_session');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  private isLockedOut(email: string): boolean {
    const lockoutData = localStorage.getItem(`lockout_${email}`);
    if (!lockoutData) return false;

    try {
      const lockout = JSON.parse(lockoutData);
      if (Date.now() < lockout.until) {
        return true;
      } else {
        localStorage.removeItem(`lockout_${email}`);
        return false;
      }
    } catch {
      return false;
    }
  }

  private recordFailedAttempt(email: string): void {
    const key = `login_attempts_${email}`;
    const attemptsData = localStorage.getItem(key);
    
    let attempts = 1;
    if (attemptsData) {
      try {
        const data = JSON.parse(attemptsData);
        attempts = data.count + 1;
      } catch {
        attempts = 1;
      }
    }

    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = Date.now() + this.LOCKOUT_DURATION;
      localStorage.setItem(`lockout_${email}`, JSON.stringify({ until: lockoutUntil }));
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify({ count: attempts, timestamp: Date.now() }));
    }
  }

  private clearLoginAttempts(email: string): void {
    localStorage.removeItem(`login_attempts_${email}`);
    localStorage.removeItem(`lockout_${email}`);
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    
    const nameErrors = validateName(sanitizedName);
    if (nameErrors.length > 0) {
      return of({ 
        success: false, 
        message: nameErrors.join('. ') 
      });
    }
    
    if (!validateEmail(sanitizedEmail)) {
      return of({ 
        success: false, 
        message: 'Email inválido' 
      });
    }
    
    const passwordErrors = validatePasswordStrength(password);
    if (passwordErrors.length > 0) {
      return of({ 
        success: false, 
        message: passwordErrors.join('. ') 
      });
    }

    return this.http.get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(sanitizedEmail)}`).pipe(
      switchMap(users => {
        if (users && users.length > 0) {
          return of({ 
            success: false, 
            message: 'Email já cadastrado no sistema' 
          });
        }

        return new Observable<AuthResponse>(observer => {
          hashPassword(password).then(passwordHash => {
            const now = new Date().toISOString();
            
            const newUser: Omit<User, 'id'> = {
              name: sanitizedName,
              email: sanitizedEmail,
              passwordHash: passwordHash,
              photoUrl: '',
              createdAt: now,
              updatedAt: now
            };

            this.http.post<User>(this.apiUrl, newUser).pipe(
              switchMap(user => {
                return this.createSession(user);
              }),
              catchError(error => {
                console.error('Erro ao criar usuário:', error);
                return of({ 
                  success: false, 
                  message: 'Erro ao registrar usuário. Tente novamente.' 
                });
              })
            ).subscribe(response => {
              observer.next(response);
              observer.complete();
            });
          }).catch(error => {
            console.error('Erro ao fazer hash da senha:', error);
            observer.next({ 
              success: false, 
              message: 'Erro ao processar senha' 
            });
            observer.complete();
          });
        });
      }),
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const sanitizedEmail = sanitizeInput(email).toLowerCase().trim();
    
    if (!validateEmail(sanitizedEmail)) {
      return of({ 
        success: false, 
        message: 'Email inválido' 
      });
    }

    if (!password || password.length === 0) {
      return of({ 
        success: false, 
        message: 'Senha é obrigatória' 
      });
    }

    if (this.isLockedOut(sanitizedEmail)) {
      return of({ 
        success: false, 
        message: 'Conta temporariamente bloqueada por múltiplas tentativas falhas. Tente novamente em 15 minutos.' 
      });
    }

    return this.http.get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(sanitizedEmail)}`).pipe(
      switchMap(users => {
        if (!users || users.length === 0) {
          this.recordFailedAttempt(sanitizedEmail);
          return of({ 
            success: false, 
            message: 'Email ou senha inválidos' 
          });
        }

        const user = users[0];
        
        return new Observable<AuthResponse>(observer => {
          hashPassword(password).then(passwordHash => {
            if (passwordHash !== user.passwordHash) {
              this.recordFailedAttempt(sanitizedEmail);
              observer.next({ 
                success: false, 
                message: 'Email ou senha inválidos' 
              });
              observer.complete();
              return;
            }

            this.clearLoginAttempts(sanitizedEmail);
            
            const updatedUser = {
              ...user,
              lastLoginAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            this.http.patch<User>(`${this.apiUrl}/${user.id}`, {
              lastLoginAt: updatedUser.lastLoginAt,
              updatedAt: updatedUser.updatedAt
            }).subscribe();

            this.createSession(updatedUser).subscribe(response => {
              observer.next(response);
              observer.complete();
            });
          }).catch(error => {
            console.error('Erro ao verificar senha:', error);
            observer.next({ 
              success: false, 
              message: 'Erro ao processar login' 
            });
            observer.complete();
          });
        });
      }),
      catchError(error => {
        console.error('Erro ao fazer login:', error);
        return of({ 
          success: false, 
          message: 'Erro ao fazer login. Tente novamente.' 
        });
      })
    );
  }

  private createSession(user: User): Observable<AuthResponse> {
    const token = generateSessionToken();
    const expiresAt = createExpirationTime(24); // 24 horas
    
    const session: AuthSession = {
      userId: user.id,
      token: token,
      expiresAt: expiresAt,
      createdAt: Date.now()
    };

    return this.http.post<AuthSession>(this.sessionsUrl, session).pipe(
      map(() => {
        const userPublic: UserPublic = {
          id: user.id,
          name: user.name,
          email: user.email,
          photoUrl: user.photoUrl,
          monthlyIncome: user.monthlyIncome,
          salaryAutoAddEnabled: user.salaryAutoAddEnabled,
          salaryAutoAddDay: user.salaryAutoAddDay,
          lastSalaryAddDate: user.lastSalaryAddDate,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        };

        localStorage.setItem('auth_session', JSON.stringify(session));
        localStorage.setItem('current_user', JSON.stringify(userPublic));
        
        this.currentUserSubject.next(userPublic);
        this.isLoggedInSubject.next(true);

        return { 
          success: true, 
          user: userPublic,
          token: token,
          message: 'Login realizado com sucesso!' 
        };
      }),
      catchError(error => {
        console.error('Erro ao criar sessão:', error);
        return of({ 
          success: false, 
          message: 'Erro ao criar sessão' 
        });
      })
    );
  }

  logout(): void {
    const sessionData = localStorage.getItem('auth_session');
    
    if (sessionData) {
      try {
        const session: AuthSession = JSON.parse(sessionData);
        this.http.get<AuthSession[]>(`${this.sessionsUrl}?userId=${session.userId}&token=${session.token}`).pipe(
          switchMap(sessions => {
            if (sessions && sessions.length > 0) {
              return this.http.delete(`${this.sessionsUrl}/${sessions[0].userId}`);
            }
            return of(null);
          })
        ).subscribe();
      } catch (error) {
        console.error('Erro ao remover sessão do servidor:', error);
      }
    }

    this.clearSession();
    
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    
    this.router.navigate(['/login']);
  }

  getCurrentUser(): UserPublic | null {
    return this.currentUserSubject.getValue();
  }

  isAuthenticated(): boolean {
    const isLoggedIn = this.isLoggedInSubject.getValue();
    if (!isLoggedIn) return false;

    const sessionData = localStorage.getItem('auth_session');
    if (!sessionData) return false;

    try {
      const session: AuthSession = JSON.parse(sessionData);
      return this.isValidSession(session);
    } catch {
      return false;
    }
  }

  updateUser(userId: number, updates: Partial<UserPublic>): Observable<UserPublic> {
    const sanitizedUpdates: Partial<User> = {};
    
    if (updates.name) {
      const sanitizedName = sanitizeInput(updates.name);
      const nameErrors = validateName(sanitizedName);
      if (nameErrors.length > 0) {
        return throwError(() => new Error(nameErrors.join('. ')));
      }
      sanitizedUpdates.name = sanitizedName;
    }
    
    if (updates.photoUrl) {
      sanitizedUpdates.photoUrl = sanitizeInput(updates.photoUrl);
    }

    if (updates.monthlyIncome !== undefined) {
      sanitizedUpdates.monthlyIncome = updates.monthlyIncome;
    }

    if (updates.salaryAutoAddEnabled !== undefined) {
      sanitizedUpdates.salaryAutoAddEnabled = updates.salaryAutoAddEnabled;
    }

    if (updates.salaryAutoAddDay !== undefined) {
      sanitizedUpdates.salaryAutoAddDay = updates.salaryAutoAddDay;
    }

    if (updates.lastSalaryAddDate !== undefined) {
      sanitizedUpdates.lastSalaryAddDate = updates.lastSalaryAddDate;
    }

    sanitizedUpdates.updatedAt = new Date().toISOString();

    return this.http.patch<User>(`${this.apiUrl}/${userId}`, sanitizedUpdates).pipe(
      map(user => {
        const userPublic: UserPublic = {
          id: user.id,
          name: user.name,
          email: user.email,
          photoUrl: user.photoUrl,
          monthlyIncome: user.monthlyIncome,
          salaryAutoAddEnabled: user.salaryAutoAddEnabled,
          salaryAutoAddDay: user.salaryAutoAddDay,
          lastSalaryAddDate: user.lastSalaryAddDate,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        };
        
        this.currentUserSubject.next(userPublic);
        localStorage.setItem('current_user', JSON.stringify(userPublic));
        
        return userPublic;
      }),
      catchError(error => {
        console.error('Erro ao atualizar usuário:', error);
        return throwError(() => new Error('Erro ao atualizar dados do usuário'));
      })
    );
  }

  loginWithGoogle(): Observable<AuthResponse> {
    return of({
      success: false,
      message: 'Login social não implementado nesta versão. Por favor, use email e senha.'
    }).pipe(delay(300));
  }

  loginWithFacebook(): Observable<AuthResponse> {
    return of({
      success: false,
      message: 'Login social não implementado nesta versão. Por favor, use email e senha.'
    }).pipe(delay(300));
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    const sanitizedEmail = sanitizeInput(email).toLowerCase().trim();
    
    if (!validateEmail(sanitizedEmail)) {
      return of({
        success: false,
        message: 'Email inválido'
      });
    }

    return this.http.get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(sanitizedEmail)}`).pipe(
      map(users => {
        if (!users || users.length === 0) {
          return {
            success: true,
            message: 'Se o email existir no sistema, você receberá um link de recuperação.'
          };
        }
        
        return {
          success: true,
          message: 'Link de recuperação enviado para seu email (funcionalidade simulada)'
        };
      }),
      catchError(error => {
        console.error('Erro ao recuperar senha:', error);
        return of({
          success: false,
          message: 'Erro ao processar recuperação de senha'
        });
      }),
      delay(500)
    );
  }

  ngOnDestroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
  }
}
