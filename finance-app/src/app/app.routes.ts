import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Transactions } from './pages/transactions/transactions';
import { AddIncome } from './pages/add-income/add-income';
import { AddExpense } from './pages/add-expense/add-expense';
import { Profile } from './pages/profile/profile';
import { Developers } from './pages/developers/developers';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { 
    path: 'home', 
    component: Home,
    canActivate: [authGuard]
  },
  { 
    path: 'transactions', 
    component: Transactions,
    canActivate: [authGuard]
  },
  { 
    path: 'add-income', 
    component: AddIncome,
    canActivate: [authGuard]
  },
  { 
    path: 'add-expense', 
    component: AddExpense,
    canActivate: [authGuard]
  },
  { 
    path: 'profile', 
    component: Profile,
    canActivate: [authGuard]
  },
  { 
    path: 'developers', 
    component: Developers
  },
  { path: '**', redirectTo: 'login' }
];
