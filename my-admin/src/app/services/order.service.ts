import { inject, Injectable } from '@angular/core';
import { Order } from '../classes/order';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:4000/orders'; // 🔹 Thay đổi nếu cần

  http = inject(HttpClient);
  constructor() { }
  
  getOrdersByCustomerID(customerID: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/customer/${customerID}`);
  }
}