import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app.routes';
import { App } from './app';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';

@NgModule({
  declarations: [
    App,
    Login,
    Home
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }
