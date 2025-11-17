import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-add-income',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-income.html',
  styleUrls: ['./add-income.css']
})
export class AddIncome implements OnInit {
  incomeForm: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.incomeForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [this.getTodayDate(), Validators.required],
      category: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private loadCategories(): void {
    this.categoryService.getIncomeCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Erro ao carregar categorias:', err);
        this.errorMessage = 'Erro ao carregar categorias';
      }
    });
  }

  onSubmit(): void {
    if (this.incomeForm.invalid) {
      this.markFormGroupTouched(this.incomeForm);
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.incomeForm.value;
    const transaction = {
      type: 'income' as const,
      amount: Number(formValue.amount),
      date: new Date(formValue.date),
      category: formValue.category,
      description: formValue.description || undefined
    };

    this.transactionService.addTransaction(transaction).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.successMessage = 'Receita adicionada com sucesso!';
        
        // Reseta o formulário após 1 segundo
        setTimeout(() => {
          this.incomeForm.reset({
            date: this.getTodayDate()
          });
          this.successMessage = '';
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Erro ao adicionar receita';
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.incomeForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    
    if (control?.hasError('min')) {
      return 'O valor deve ser maior que zero';
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.incomeForm.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  navigateToTransactions(): void {
    this.router.navigate(['/transactions']);
  }
}
