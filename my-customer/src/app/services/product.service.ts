import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { Product, Pagination } from '../classes/Product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:4000/api/products'; // Đúng với backend

  constructor(private http: HttpClient) {}

  // Xử lý lỗi chung
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Đã xảy ra lỗi không xác định!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi phía Client: ${error.error.message}`;
    } else {
      errorMessage = `Lỗi Server (Mã lỗi: ${error.status}): ${error.error?.error || error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // 1. Lấy danh sách sản phẩm (có bộ lọc và phân trang)
  getProducts(filters: any = {}, page: number = 1, limit: number = 12): Observable<{
    data: Product[]; 
    pagination: Pagination 
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
  
    // Thêm các tham số filter
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<{ data: Product[]; pagination: Pagination }>(this.apiUrl, { params });
  }
  
  
    // Hàm lấy ảnh từ API riêng
    getImage(imageId: string): Observable<any> {
      return this.http.get(`http://localhost:4000/api/images/${imageId}`);
    }
    
    getCategories(): Observable<any> {
      return this.http.get<any[]>('http://localhost:4000/api/categories').pipe(
        map((categories: any[]) => categories.map(c => ({
          CateID: c.CateID,
          CateName: c.CateName
        })))
      );
    }
    
    getFilters(): Observable<any> {
      return this.http.get('http://localhost:4000/api/filters').pipe(catchError(this.handleError));
    }
    

  // 2. Lấy chi tiết sản phẩm
  getProductDetail(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(2),
        map(response => {
          if (!response) throw new Error("Product not found!");
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // 3. Thêm sản phẩm vào giỏ hàng
  addToCart(productId: string, quantity: number = 1): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { productId, quantity };

    return this.http.post(`http://localhost:4000/api/cart`, body, { headers })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // 4. Xóa sản phẩm khỏi giỏ hàng
  removeFromCart(productId: string): Observable<any> {
    return this.http.delete(`http://localhost:4000/api/cart/${productId}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // 5. Lấy danh sách sản phẩm trong giỏ hàng
  getCartItems(): Observable<any> {
    return this.http.get(`http://localhost:4000/api/cart`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // 6. Thêm sản phẩm vào danh sách so sánh
  addToCompare(productId: string, p0: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { productId };

    return this.http.post(`http://localhost:4000/api/compare`, body, { headers })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // 7. Xóa sản phẩm khỏi danh sách so sánh
  removeFromCompare(productId: string): Observable<any> {
    return this.http.delete(`http://localhost:4000/api/compare/${productId}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // 8. Lấy danh sách sản phẩm trong danh sách so sánh
  getCompareItems(): Observable<any> {
    return this.http.get(`http://localhost:4000/api/compare`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
}
