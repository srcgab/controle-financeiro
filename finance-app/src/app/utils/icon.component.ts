import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      [attr.width]="size" 
      [attr.height]="size" 
      [attr.viewBox]="viewBox" 
      [attr.fill]="fill"
      [class]="iconClass">
      <ng-container [ngSwitch]="name">
        <!-- Delete/Trash Icon -->
        <g *ngSwitchCase="'delete'">
          <path d="M3 6v18c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6H3zm5 14c0 .6-.4 1-1 1s-1-.4-1-1V10c0-.6.4-1 1-1s1 .4 1 1v8zm4 0c0 .6-.4 1-1 1s-1-.4-1-1V10c0-.6.4-1 1-1s1 .4 1 1v8zm4 0c0 .6-.4 1-1 1s-1-.4-1-1V10c0-.6.4-1 1-1s1 .4 1 1v8z"/>
          <path d="M19 4h-3.5l-1-1h-5l-1 1H5c-.6 0-1 .4-1 1s.4 1 1 1h14c.6 0 1-.4 1-1s-.4-1-1-1z"/>
        </g>
        
        <!-- Edit Icon -->
        <g *ngSwitchCase="'edit'">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </g>
        
        <!-- Plus Icon -->
        <g *ngSwitchCase="'plus'">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </g>
        
        <!-- Default fallback -->
        <circle *ngSwitchDefault cx="12" cy="12" r="10"/>
      </ng-container>
    </svg>
  `,
  styles: [`
    svg {
      display: inline-block;
      vertical-align: middle;
      transition: all 0.2s ease;
    }
    
    .icon-delete {
      color: #dc3545;
    }
    
    .icon-delete:hover {
      color: #c82333;
      transform: scale(1.1);
    }
    
    .icon-edit {
      color: #007bff;
    }
    
    .icon-edit:hover {
      color: #0056b3;
      transform: scale(1.1);
    }
    
    .icon-plus {
      color: #28a745;
    }
    
    .icon-plus:hover {
      color: #1e7e34;
      transform: scale(1.1);
    }
  `]
})
export class IconComponent {
  @Input() name: string = '';
  @Input() size: number = 24;
  @Input() fill: string = 'currentColor';
  @Input() iconClass: string = '';

  get viewBox(): string {
    return '0 0 24 24';
  }
}