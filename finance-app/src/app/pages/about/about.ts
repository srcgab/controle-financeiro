import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface TeamMember {
  name: string;
  role: string;
  description: string;
  photoUrl: string;
}

interface Pillar {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  mission = 'Democratizar o acesso ao controle financeiro pessoal através de uma plataforma intuitiva, ' +
    'transparente e segura que capacita indivíduos a tomarem decisões financeiras mais inteligentes e ' +
    'alcançarem seus objetivos de vida.';

  pillars: Pillar[] = [
    {
      title: 'Simplicidade',
      description: 'Interface intuitiva e fácil de usar, tornando o controle financeiro acessível para todos, ' +
        'independente do nível de conhecimento em finanças.',
      icon: '🎯'
    },
    {
      title: 'Segurança',
      description: 'Proteção robusta dos seus dados financeiros com as melhores práticas de segurança e privacidade ' +
        'da informação.',
      icon: '🔒'
    },
    {
      title: 'Transparência',
      description: 'Visualização clara e objetiva da sua situação financeira com relatórios detalhados e insights ' +
        'acionáveis para melhorar sua saúde financeira.',
      icon: '📊'
    }
  ];

  teamMembers: TeamMember[] = [
    {
      name: 'Equipe FinanceApp',
      role: 'Desenvolvedores',
      description: 'Uma equipe dedicada de desenvolvedores comprometidos em criar a melhor experiência de ' +
        'gerenciamento financeiro pessoal.',
      photoUrl: 'https://via.placeholder.com/200/4CAF50/FFFFFF?text=FinanceApp'
    }
  ];

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/home']);
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
