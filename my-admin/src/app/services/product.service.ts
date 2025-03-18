import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../classes/Product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'http://localhost:4000/api/products-full-details';
  private filtersUrl = 'http://localhost:4000/api/filters';
  private apiUrl = 'http://localhost:4000/api';
  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any>(this.productsUrl).pipe(
      map(response => {
        console.log("Dữ liệu API trả về:", response); // 🟢 Kiểm tra API
        return response.data || []; // Trả về mảng sản phẩm (nếu có)
      })
    );
  }

  // getProducts(): Observable<any[]> {
  //   return this.http.get<any>(`${this.apiUrl}/products`).pipe(
  //     map((data: any) => {
  //       console.log('Raw data from API:', data); // Log dữ liệu thô từ API
  //       return Array.isArray(data) ? data : [];
  //     }),
  //     catchError((error) => {
  //       console.error('Error fetching products:', error); // Log lỗi chi tiết
  //       return of([]); // Trả về mảng rỗng nếu có lỗi
  //     })
  //   );
  // }
  deleteProduct(productId: string): Observable<void> {
    const deleteUrl = `http://localhost:4000/api/products/${productId}`;
    console.log("🛑 Gọi API xóa:", deleteUrl);
    return this.http.delete<void>(deleteUrl);
  }
  

  getFilters(): Observable<any> {
    return this.http.get<any>(this.filtersUrl);
  }
  

  getSearchSuggestions(query: string): Observable<string[]> {
    return this.http.get<string[]>(`http://localhost:4000/api/products/search?q=${query}`);
  }

  getProductById(productId: string): Observable<any> {
    const url = `${this.apiUrl}/products/${productId}`;
    return this.http.get<any>(url).pipe(
      map(response => response),
      catchError((error) => {
        console.error('Error fetching product details:', error);
        throw error;
      })
    );
  }

  getProductsFullDetails(): Observable<{ data: Product[] }> {
    const url = `${this.apiUrl}/products-full-details`;
    return this.http.get<{ data: Product[] }>(url);
  }
  
}
