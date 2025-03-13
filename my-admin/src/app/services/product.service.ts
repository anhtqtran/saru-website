import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'http://localhost:4000/api/products-full-details';
  private filtersUrl = 'http://localhost:4000/api/filters';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any>(this.productsUrl).pipe(
      map(response => {
        console.log("Dữ liệu API trả về:", response); // 🟢 Kiểm tra API
        return response.data || []; // Trả về mảng sản phẩm (nếu có)
      })
    );
  }

  deleteProduct(productId: string): Observable<void> {
    const deleteUrl = `http://localhost:4000/api/products/${productId}`; // Đúng URL
    console.log("🛑 Gọi API xóa:", deleteUrl);
    return this.http.delete<void>(deleteUrl);
  }
  

  getFilters(): Observable<any> {
    return this.http.get<any>(this.filtersUrl);
  }
  

  getSearchSuggestions(query: string): Observable<string[]> {
    return this.http.get<string[]>(`http://localhost:4000/api/products/search?q=${query}`);
  }
  
}
