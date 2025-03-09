import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, retry, throwError, combineLatest } from 'rxjs';
import { Product, Pagination } from '../classes/Product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:4000/api';
  private compareListUpdated = new BehaviorSubject<void>(undefined);
  private cartSubject = new BehaviorSubject<any[]>([]); // Trạng thái giỏ hàng
  private compareSubject = new BehaviorSubject<string[]>([]); // Trạng thái danh sách so sánh

  // Observable để các component lắng nghe
  cart$ = this.cartSubject.asObservable();
  compare$ = this.compareSubject.asObservable();

  constructor(private http: HttpClient) {}

resetCartAndCompare(): void {
    // Không reset hoàn toàn, thay vào đó tải lại dữ liệu từ backend
    this.getCartItems().subscribe({
      next: (cart) => this.updateCart(cart),
      error: (err) => console.error('Error resetting cart:', err)
    });
    this.getCompareItems().subscribe({
      next: (compare) => this.updateCompare(compare),
      error: (err) => console.error('Error resetting compare:', err)
    });
  }

  // Phát tín hiệu khi danh sách so sánh thay đổi
  notifyCompareListUpdated(): void {
    this.compareListUpdated.next();
  }

  getCompareListUpdated(): Observable<void> {
    return this.compareListUpdated.asObservable();
  }
  
  // Observable để các component lắng nghe thay đổi
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
    if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
      params = params.set(key, filters[key].toString());
    }
  });
  return this.http.get<{ data: Product[]; pagination: Pagination }>(`${this.apiUrl}/products`, { params }).pipe(
    catchError(this.handleError)
  );
}
  
  
    // Hàm lấy ảnh từ API riêng
    getImage(imageId: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/images/${imageId}`);
    }

getCategories(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(
      map((categories: any[]) => categories.map(c => ({
        CateID: c.CateID,
        CateName: c.CateName
      })))
    );
  }
    
  getFilters(): Observable<any> {
    return this.http.get(`${this.apiUrl}/filters`).pipe(catchError(this.handleError));
  }

  // 2. Lấy chi tiết sản phẩm
  getProductDetail(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
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
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    const body = { productId, quantity };

    return this.http.post(`${this.apiUrl}/cart`, body, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      map(response => {
        this.getCartItems().subscribe(cart => this.updateCart(cart)); // Cập nhật sau khi thêm
        return response;
      })
    );
  }
  // 4. Xóa sản phẩm khỏi giỏ hàng
  removeFromCart(productId: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.delete(`${this.apiUrl}/cart/${productId}`, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      map(response => {
        this.getCartItems().subscribe(cart => this.updateCart(cart)); // Cập nhật sau khi xóa
        return response;
      })
    );
  }

  // 5. Lấy danh sách sản phẩm trong giỏ hàng
  getCartItems(): Observable<any[]> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/cart`, { headers, withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  // 6. Thêm sản phẩm vào danh sách so sánh
addToCompare(productId: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    const body = { productId };

    return this.http.post(`${this.apiUrl}/compare`, body, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      map(response => {
        this.notifyCompareListUpdated();
        this.getCompareItems().subscribe(compare => this.updateCompare(compare)); // Cập nhật sau khi thêm
        return response;
      })
    );
  }

  removeFromCompare(productId: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.delete(`${this.apiUrl}/compare/${productId}`, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      map(response => {
        this.notifyCompareListUpdated();
        this.getCompareItems().subscribe(compare => this.updateCompare(compare)); // Cập nhật sau khi xóa
        return response;
      })
    );
  }

removeAllFromCompare(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.delete(`${this.apiUrl}/compare/all`, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      map(response => {
        this.notifyCompareListUpdated();
        this.updateCompare([]); // Reset danh sách so sánh
        return response;
      })
    );
  }
  getCompareItems(): Observable<string[]> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.get<string[]>(`${this.apiUrl}/compare`, { headers, withCredentials: true }).pipe(
      catchError(err => {
        console.error('Error fetching compare items:', err);
        return throwError(() => new Error('Không thể lấy danh sách so sánh'));
      })
    );
  }

  // Cập nhật trạng thái giỏ hàng
  updateCart(cart: any[]): void {
    this.cartSubject.next(cart);
  }

  // Cập nhật trạng thái danh sách so sánh
  updateCompare(compare: string[]): void {
    this.compareSubject.next(compare);
  }

  combineLatest(observables: Observable<Product>[]): Observable<Product[]> {
    return combineLatest(observables).pipe(
      map(results => results)
    );
  }
}