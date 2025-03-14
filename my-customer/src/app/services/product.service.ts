import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, retry, throwError, combineLatest, of, tap } from 'rxjs';
import { Product, Pagination } from '../classes/Product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:4000/api';
  private compareListUpdated = new BehaviorSubject<void>(undefined);
  private cartSubject = new BehaviorSubject<any[]>([]);
  private compareSubject = new BehaviorSubject<string[]>([]);
  private loginStatusChanged = new BehaviorSubject<void>(undefined);

  // Observables để các component lắng nghe
  cart$ = this.cartSubject.asObservable();
  compare$ = this.compareSubject.asObservable();
  loginStatusChanged$ = this.loginStatusChanged.asObservable();
  compareListUpdated$ = this.compareListUpdated.asObservable();

  constructor(private http: HttpClient) {
    this.initializeState();
  }

  // Khởi tạo trạng thái ban đầu
  private initializeState(): void {
    this.getCartItems().subscribe({
      next: (cart) => this.updateCart(cart),
      error: (err) => console.error('Error initializing cart:', err)
    });
    this.getCompareItems().subscribe({
      next: (compare) => this.updateCompare(compare),
      error: (err) => console.error('Error initializing compare:', err)
    });
  }

  // Thông báo khi trạng thái đăng nhập thay đổi
  notifyLoginStatusChanged(): void {
    this.loginStatusChanged.next();
    this.resetCartAndCompare();
  }

  // Thông báo khi danh sách so sánh thay đổi
  notifyCompareListUpdated(): void {
    this.compareListUpdated.next();
  }

  getCompareListUpdated(): Observable<void> {
    return this.compareListUpdated.asObservable();
  }

  // Reset giỏ hàng và danh sách so sánh
  resetCartAndCompare(): void {
    this.getCartItems().subscribe({
      next: (cart) => this.updateCart(cart),
      error: (err) => console.error('Error resetting cart:', err)
    });
    this.getCompareItems().subscribe({
      next: (compare) => this.updateCompare(compare),
      error: (err) => console.error('Error resetting compare:', err)
    });
  }

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

  // Lấy danh sách sản phẩm
  getProducts(filters: any = {}, page: number = 1, limit: number = 12): Observable<{
    data: Product[];
    pagination: Pagination
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key].toString());
      }
    });
    return this.http.get<{ data: Product[]; pagination: Pagination }>(`${this.apiUrl}/products`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy ảnh sản phẩm
  getImage(imageId: string): Observable<any> {
    if (!imageId) return of({ ProductImageCover: 'assets/images/default-product.png' });
    return this.http.get(`${this.apiUrl}/images/${imageId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy danh mục
  getCategories(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(
      map((categories: any[]) => categories.map(c => ({
        CateID: c.CateID,
        CateName: c.CateName
      }))),
      catchError(this.handleError)
    );
  }

  // Lấy bộ lọc
  getFilters(): Observable<any> {
    return this.http.get(`${this.apiUrl}/filters`).pipe(
      catchError(this.handleError)
    );
  }

  // Lấy chi tiết sản phẩm
  getProductDetail(id: string): Observable<Product | null> {
    if (!id) return of(null);
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      retry(2),
      map(response => response || null),
      catchError(err => {
        console.warn(`Product ${id} not found or error occurred:`, err);
        return of(null);
      })
    );
  }

  // Thêm vào giỏ hàng
  addToCart(productId: string, quantity: number = 1): Observable<any> {
    if (!productId) throw new Error('Product ID is required');
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    const body = { productId, quantity };

    return this.http.post(`${this.apiUrl}/cart`, body, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      tap(() => {
        this.getCartItems().subscribe({
          next: (cart) => this.updateCart(cart),
          error: (err) => console.error('Error updating cart after add:', err)
        });
      })
    );
  }

  // Xóa khỏi giỏ hàng
  removeFromCart(productId: string): Observable<any> {
    if (!productId) throw new Error('Product ID is required');
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.delete(`${this.apiUrl}/cart/${productId}`, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      tap(() => {
        this.getCartItems().subscribe({
          next: (cart) => this.updateCart(cart),
          error: (err) => console.error('Error updating cart after remove:', err)
        });
      })
    );
  }

  // Xóa toàn bộ giỏ hàng (thêm mới)
  removeAllFromCart(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.delete(`${this.apiUrl}/cart/all`, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      tap(() => {
        this.updateCart([]); // Reset giỏ hàng ngay lập tức
      })
    );
  }

  // Lấy danh sách giỏ hàng
  getCartItems(): Observable<any[]> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/cart`, { headers, withCredentials: true }).pipe(
      catchError(err => {
        console.error('Error fetching cart items:', err);
        return of([]); // Trả về mảng rỗng nếu lỗi
      })
    );
  }

  // Thêm vào danh sách so sánh (giữ nguyên từ đoạn gốc)
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
        this.getCompareItems().subscribe({
          next: (compare) => this.updateCompare(compare),
          error: (err) => console.error('Error updating compare after add:', err)
        });
        return response;
      })
    );
  }

  // Xóa khỏi danh sách so sánh (giữ nguyên từ đoạn gốc)
  removeFromCompare(productId: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.delete(`${this.apiUrl}/compare/${productId}`, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      map(response => {
        this.notifyCompareListUpdated();
        this.getCompareItems().subscribe({
          next: (compare) => this.updateCompare(compare),
          error: (err) => console.error('Error updating compare after remove:', err)
        });
        return response;
      })
    );
  }

  // Xóa toàn bộ danh sách so sánh (giữ nguyên từ đoạn gốc)
  removeAllFromCompare(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.delete(`${this.apiUrl}/compare/all`, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      map(response => {
        this.notifyCompareListUpdated();
        this.updateCompare([]);
        return response;
      })
    );
  }

  // Lấy danh sách so sánh (giữ nguyên từ đoạn gốc)
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

  // Kết hợp nhiều Observable
  combineLatest(observables: Observable<Product | null>[]): Observable<Product[]> {
    return combineLatest(observables).pipe(
      map(results => results.filter(p => p !== null) as Product[])
    );
  }
}