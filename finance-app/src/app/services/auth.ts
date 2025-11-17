import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  photoUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Verifica se há usuário logado no localStorage
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    // Verifica se o email já existe
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}`).pipe(
      map(users => {
        if (users.length > 0) {
          throw new Error('Email já cadastrado');
        }
        return users;
      }),
      catchError(() => of([])),
      map(() => {
        // Cria novo usuário
        const newUser: Omit<User, 'id'> = {
          name,
          email,
          password,
          photoUrl: '',
          createdAt: new Date().toISOString()
        };
        return newUser;
      }),
      // Salva o usuário
      tap(newUser => {
        this.http.post<User>(this.apiUrl, newUser).pipe(
          tap(user => {
            const userWithoutPassword = { ...user, password: '' };
            this.currentUserSubject.next(userWithoutPassword);
            localStorage.setItem('current_user', JSON.stringify(userWithoutPassword));
          })
        ).subscribe();
      }),
      map(() => ({ success: true, message: 'Cadastro realizado com sucesso!' })),
      catchError(error => {
        return of({ success: false, message: error.message || 'Erro ao registrar usuário' });
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}&password=${password}`).pipe(
      map(users => {
        if (users.length === 0) {
          throw new Error('Credenciais inválidas');
        }
        const user = users[0];
        const userWithoutPassword = { ...user, password: '' };
        this.currentUserSubject.next(userWithoutPassword);
        localStorage.setItem('current_user', JSON.stringify(userWithoutPassword));
        return { success: true, user: userWithoutPassword };
      }),
      catchError(error => {
        return of({ success: false, message: error.message || 'Erro ao fazer login' });
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('current_user');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  updateUser(userId: number, updates: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}`, updates).pipe(
      tap(user => {
        const userWithoutPassword = { ...user, password: '' };
        this.currentUserSubject.next(userWithoutPassword);
        localStorage.setItem('current_user', JSON.stringify(userWithoutPassword));
      })
    );
  }
}
