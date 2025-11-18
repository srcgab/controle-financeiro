import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isLoading = false;
  isEditing = false;
  feedback = '';
  feedbackType: 'success' | 'error' = 'success';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.initializeForm();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      name: [this.currentUser?.name || '', [Validators.required, Validators.minLength(3)]],
      email: [{ value: this.currentUser?.email || '', disabled: true }],
      photoUrl: [this.currentUser?.photoUrl || '']
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.feedback = '';
    
    if (!this.isEditing) {
      this.initializeForm();
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.showFeedback('Por favor, selecione um arquivo de imagem válido.', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.showFeedback('O arquivo deve ter no máximo 2MB.', 'error');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.showFeedback('Por favor, preencha todos os campos corretamente.', 'error');
      return;
    }

    if (!this.currentUser) {
      return;
    }

    this.isLoading = true;
    this.feedback = '';

    const updates: Partial<User> = {
      name: this.profileForm.get('name')?.value
    };
    if (this.previewUrl) {
      updates.photoUrl = this.previewUrl;
    }

    this.authService.updateUser(this.currentUser.id, updates).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.isLoading = false;
        this.isEditing = false;
        this.selectedFile = null;
        this.previewUrl = null;
        this.showFeedback('Perfil atualizado com sucesso!', 'success');
        this.initializeForm();
      },
      error: (error) => {
        this.isLoading = false;
        this.showFeedback(
          error.message || 'Erro ao atualizar perfil. Tente novamente.',
          'error'
        );
      }
    });
  }

  private showFeedback(message: string, type: 'success' | 'error'): void {
    this.feedback = message;
    this.feedbackType = type;

    setTimeout(() => {
      this.feedback = '';
    }, 5000);
  }

  logout(): void {
    this.authService.logout();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  get userName(): string {
    return this.currentUser?.name || 'Usuário';
  }

  get userEmail(): string {
    return this.currentUser?.email || '';
  }

  get userPhoto(): string {
    return this.previewUrl || this.currentUser?.photoUrl || 'https://via.placeholder.com/150';
  }

  get nameControl() {
    return this.profileForm.get('name');
  }

  get isNameInvalid(): boolean {
    const control = this.nameControl;
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
