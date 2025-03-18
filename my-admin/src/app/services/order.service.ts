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

  // getAllBlogs(){
  //   return this.http.get<Order[]>('http://localhost:4000/orders');
  // }
  getOrdersByCustomerID(customerID: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/customer/${customerID}`);
  }
  // getBlogById(id:string){
  //   return this.http.get<Order>('http://localhost:4000/orders/'+id);
  // }
  // addBlog(model: Order){
  //   return this.http.post('http://localhost:4000/orders', model);
  // }
  // updateBlog(id: string, model: Order){
  //   return this.http.put('http://localhost:4000/orders/'+id, model);
  // }
  // deleteBlogById(id:string){
  //   return this.http.delete('http://localhost:4000/orders/'+id);
  // }
}
