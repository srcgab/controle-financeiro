import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { Category } from '../models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return income categories', (done) => {
    service.getIncomeCategories().subscribe((categories: Category[]) => {
      expect(categories).toBeTruthy();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.every(cat => cat.type === 'income')).toBe(true);
      done();
    });
  });

  it('should return expense categories', (done) => {
    service.getExpenseCategories().subscribe((categories: Category[]) => {
      expect(categories).toBeTruthy();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.every(cat => cat.type === 'expense')).toBe(true);
      done();
    });
  });

  it('should find category by id', (done) => {
    service.getCategoryById(1).subscribe((category: Category | undefined) => {
      expect(category).toBeTruthy();
      expect(category?.id).toBe(1);
      done();
    });
  });

  it('should find category by name', (done) => {
    service.getCategoryByName('Salário').subscribe((categories: Category[]) => {
      expect(categories).toBeTruthy();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0].name).toBe('Salário');
      expect(categories[0].type).toBe('income');
      done();
    });
  });

  it('should return undefined for non-existent category id', (done) => {
    service.getCategoryById(999).subscribe((category: Category | undefined) => {
      expect(category).toBeUndefined();
      done();
    });
  });

  it('should persist categories to localStorage', () => {
    service.getIncomeCategories().subscribe(() => {
      const saved = localStorage.getItem('income_categories');
      expect(saved).toBeTruthy();
    });
  });
});
