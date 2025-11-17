import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getIncomeCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}?type=income`);
  }

  getExpenseCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}?type=expense`);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  getCategoryByName(name: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}?name=${name}`).pipe(
      map(categories => categories)
    );
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }
}
