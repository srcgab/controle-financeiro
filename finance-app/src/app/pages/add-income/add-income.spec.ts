import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AddIncome } from './add-income';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';

describe('AddIncome', () => {
  let component: AddIncome;
  let fixture: ComponentFixture<AddIncome>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['addTransaction']);
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getIncomeCategories']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AddIncome, ReactiveFormsModule],
      providers: [
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddIncome);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mock da resposta de categorias
    categoryService.getIncomeCategories.and.returnValue(of([
      { id: 1, name: 'Salário', type: 'income', icon: '💼' },
      { id: 2, name: 'Freelance', type: 'income', icon: '💻' }
    ]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.incomeForm).toBeTruthy();
    expect(component.incomeForm.get('amount')).toBeTruthy();
    expect(component.incomeForm.get('date')).toBeTruthy();
    expect(component.incomeForm.get('category')).toBeTruthy();
    expect(component.incomeForm.get('description')).toBeTruthy();
  });

  it('should load income categories on init', () => {
    component.ngOnInit();
    expect(categoryService.getIncomeCategories).toHaveBeenCalled();
    expect(component.categories.length).toBe(2);
  });

  it('should mark form as invalid when required fields are empty', () => {
    component.incomeForm.setValue({
      amount: '',
      date: '',
      category: '',
      description: ''
    });
    expect(component.incomeForm.invalid).toBe(true);
  });

  it('should mark form as valid when required fields are filled', () => {
    component.incomeForm.setValue({
      amount: 1000,
      date: '2025-11-17',
      category: 'Salário',
      description: 'Test'
    });
    expect(component.incomeForm.valid).toBe(true);
  });

  it('should call transactionService.addTransaction on valid form submission', () => {
    const mockTransaction = {
      id: 1,
      type: 'income' as const,
      amount: 1000,
      date: new Date('2025-11-17'),
      category: 'Salário',
      description: 'Test'
    };

    transactionService.addTransaction.and.returnValue(of(mockTransaction));

    component.incomeForm.setValue({
      amount: 1000,
      date: '2025-11-17',
      category: 'Salário',
      description: 'Test'
    });

    component.onSubmit();

    expect(transactionService.addTransaction).toHaveBeenCalled();
  });

  it('should show error message when form is invalid on submit', () => {
    component.incomeForm.setValue({
      amount: '',
      date: '',
      category: '',
      description: ''
    });

    component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(transactionService.addTransaction).not.toHaveBeenCalled();
  });

  it('should show success message after successful submission', (done) => {
    const mockTransaction = {
      id: 1,
      type: 'income' as const,
      amount: 1000,
      date: new Date('2025-11-17'),
      category: 'Salário',
      description: 'Test'
    };

    transactionService.addTransaction.and.returnValue(of(mockTransaction));

    component.incomeForm.setValue({
      amount: 1000,
      date: '2025-11-17',
      category: 'Salário',
      description: 'Test'
    });

    component.onSubmit();

    setTimeout(() => {
      expect(component.successMessage).toBeTruthy();
      expect(component.isLoading).toBe(false);
      done();
    }, 100);
  });

  it('should show error message on service error', (done) => {
    transactionService.addTransaction.and.returnValue(
      throwError(() => new Error('Service error'))
    );

    component.incomeForm.setValue({
      amount: 1000,
      date: '2025-11-17',
      category: 'Salário',
      description: 'Test'
    });

    component.onSubmit();

    setTimeout(() => {
      expect(component.errorMessage).toBeTruthy();
      expect(component.isLoading).toBe(false);
      done();
    }, 100);
  });

  it('should navigate to home when navigateToHome is called', () => {
    component.navigateToHome();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should navigate to transactions when navigateToTransactions is called', () => {
    component.navigateToTransactions();
    expect(router.navigate).toHaveBeenCalledWith(['/transactions']);
  });

  it('should validate minimum amount', () => {
    const amountControl = component.incomeForm.get('amount');
    amountControl?.setValue(-10);
    expect(amountControl?.hasError('min')).toBe(true);
  });

  it('should return appropriate error messages', () => {
    const amountControl = component.incomeForm.get('amount');
    amountControl?.setValue('');
    amountControl?.markAsTouched();
    expect(component.getErrorMessage('amount')).toBe('Este campo é obrigatório');

    amountControl?.setValue(-10);
    expect(component.getErrorMessage('amount')).toBe('O valor deve ser maior que zero');
  });
});
