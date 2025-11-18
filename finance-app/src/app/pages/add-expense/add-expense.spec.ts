import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AddExpense } from './add-expense';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';

describe('AddExpense', () => {
  let component: AddExpense;
  let fixture: ComponentFixture<AddExpense>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['addTransaction']);
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getExpenseCategories']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AddExpense, ReactiveFormsModule],
      providers: [
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddExpense);
    component = fixture.componentInstance;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    categoryService.getExpenseCategories.and.returnValue(of([
      { id: 6, name: 'Alimentação', type: 'expense', icon: '🍔' },
      { id: 7, name: 'Transporte', type: 'expense', icon: '🚗' }
    ]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.expenseForm).toBeTruthy();
    expect(component.expenseForm.get('amount')).toBeTruthy();
    expect(component.expenseForm.get('date')).toBeTruthy();
    expect(component.expenseForm.get('category')).toBeTruthy();
    expect(component.expenseForm.get('description')).toBeTruthy();
  });

  it('should load expense categories on init', () => {
    component.ngOnInit();
    expect(categoryService.getExpenseCategories).toHaveBeenCalled();
    expect(component.categories.length).toBe(2);
  });

  it('should mark form as invalid when required fields are empty', () => {
    component.expenseForm.setValue({
      amount: '',
      date: '',
      category: '',
      description: ''
    });
    expect(component.expenseForm.invalid).toBe(true);
  });

  it('should mark form as valid when required fields are filled', () => {
    component.expenseForm.setValue({
      amount: 500,
      date: '2025-11-17',
      category: 'Alimentação',
      description: 'Test'
    });
    expect(component.expenseForm.valid).toBe(true);
  });

  it('should call transactionService.addTransaction on valid form submission', () => {
    const mockTransaction = {
      id: 1,
      type: 'expense' as const,
      amount: 500,
      date: new Date('2025-11-17'),
      category: 'Alimentação',
      description: 'Test'
    };

    transactionService.addTransaction.and.returnValue(of(mockTransaction));

    component.expenseForm.setValue({
      amount: 500,
      date: '2025-11-17',
      category: 'Alimentação',
      description: 'Test'
    });

    component.onSubmit();

    expect(transactionService.addTransaction).toHaveBeenCalled();
  });

  it('should show error message when form is invalid on submit', () => {
    component.expenseForm.setValue({
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
      type: 'expense' as const,
      amount: 500,
      date: new Date('2025-11-17'),
      category: 'Alimentação',
      description: 'Test'
    };

    transactionService.addTransaction.and.returnValue(of(mockTransaction));

    component.expenseForm.setValue({
      amount: 500,
      date: '2025-11-17',
      category: 'Alimentação',
      description: 'Test'
    });

    component.onSubmit();

    setTimeout(() => {
      expect(component.successMessage).toBeTruthy();
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
});
