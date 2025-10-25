import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { Login } from './pages/login/login';     
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'home', component: Home },
  { path: '**', redirectTo: 'login' }
];

export const appConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      RouterModule.forRoot(routes)
    )
  ]
};