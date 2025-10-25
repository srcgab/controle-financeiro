import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.html'
})
export class Home {
  userName = '';

  constructor(private auth: AuthService) {
    const u = this.auth.getCurrentUser();
    this.userName = u ? u.name : 'Usuário';
  }
}
