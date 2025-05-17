import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../classes/review';
import { Customer } from '../classes/review';
import { HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:4000/api'; // Địa chỉ API từ index.js

  constructor(private http: HttpClient) { }

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews`);
  }
  getReviewsWithCustomers(startDate?: string, endDate?: string, rating?: string): Observable<any[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (rating) params = params.set('rating', rating);
    return this.http.get<any[]>(`${this.apiUrl}/reviews-with-customers`, { params });
  }

  getCustomerById(customerId: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customers/${customerId}`);
  }

  deleteReview(reviewId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`);
}
}
