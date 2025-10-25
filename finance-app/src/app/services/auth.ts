import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: User[] = [];
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    const saved = localStorage.getItem('mock_users');
    if (saved) {
      this.users = JSON.parse(saved);
      const cur = localStorage.getItem('current_user');
      if (cur) this.currentUserSubject.next(JSON.parse(cur));
    } else {
      this.users = [
        { id: 1, name: 'Teste', email: 'teste@ex.com', password: '123456' }
      ];
      localStorage.setItem('mock_users', JSON.stringify(this.users));
    }
  }

  private persist() {
    localStorage.setItem('mock_users', JSON.stringify(this.users));
  }

  register(name: string, email: string, password: string): { success: boolean; message?: string } {
    const exists = this.users.find(u => u.email === email);
    if (exists) return { success: false, message: 'Email já cadastrado' };
    const newUser: User = {
      id: this.users.length + 1,
      name,
      email,
      password
    };
    this.users.push(newUser);
    this.persist();
    this.currentUserSubject.next({ ...newUser, password: '' });
    localStorage.setItem('current_user', JSON.stringify({ ...newUser, password: '' }));
    return { success: true };
  }

  login(email: string, password: string): { success: boolean; message?: string } {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, message: 'Credenciais inválidas' };
    this.currentUserSubject.next({ ...user, password: '' });
    localStorage.setItem('current_user', JSON.stringify({ ...user, password: '' }));
    return { success: true };
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('current_user');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }
}
