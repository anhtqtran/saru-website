import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { Product } from '../classes/IProduct';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3003/product';

  constructor(private http: HttpClient) {}

  getProducts(params: any): Observable<Product[]> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const requestOptions = { headers, params };
    return this.http.get<Product[]>(this.apiUrl, requestOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getProductById(id: string): Observable<Product> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get<Product>(`${this.apiUrl}/${id}`, { headers }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message));
  }
}