import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  userName = '';

  constructor(private auth: AuthService) {
    const u = this.auth.getCurrentUser();
    this.userName = u ? u.name : 'Usuário';
  }
}