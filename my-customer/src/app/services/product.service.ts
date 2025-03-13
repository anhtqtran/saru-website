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
  
  // Thêm Subject để thông báo thay đổi trạng thái đăng nhập
  private loginStatusChanged = new BehaviorSubject<void>(undefined);

  cart$ = this.cartSubject.asObservable();
  compare$ = this.compareSubject.asObservable();
  loginStatusChanged$ = this.loginStatusChanged.asObservable();

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
  }

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

  notifyCompareListUpdated(): void {
    this.compareListUpdated.next();
  }

  getCompareListUpdated(): Observable<void> {
    return this.compareListUpdated.asObservable();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Đã xảy ra lỗi không xác định!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi phía Client: ${error.error.message}`;
    } else {
      errorMessage = `Lỗi Server (Mã lỗi: ${error.status}): ${error.error?.error || error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

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

  getImage(imageId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/images/${imageId}`).pipe(
      catchError(this.handleError)
    );
  }

  getCategories(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(
      map((categories: any[]) => categories.map(c => ({
        CateID: c.CateID,
        CateName: c.CateName
      }))),
      catchError(this.handleError)
    );
  }

  getFilters(): Observable<any> {
    return this.http.get(`${this.apiUrl}/filters`).pipe(
      catchError(this.handleError)
    );
  }

  getProductDetail(id: string): Observable<Product | null> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      retry(2),
      map(response => response || null),
      catchError(err => {
        console.warn(`Product ${id} not found or error occurred:`, err);
        return of(null); // Trả về null nếu lỗi (như 404)
      })
    );
  }

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
      map(response => {
        this.getCartItems().subscribe(cart => this.updateCart(cart));
        return response;
      })
    );
  }

  removeFromCart(productId: string): Observable<any> {
    if (!productId) throw new Error('Product ID is required');
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.delete(`${this.apiUrl}/cart/${productId}`, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      map(response => {
        this.getCartItems().subscribe(cart => this.updateCart(cart));
        return response;
      })
    );
  }

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

  addToCompare(productId: string): Observable<any> {
    if (!productId) throw new Error('Product ID is required');
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
        this.getCompareItems().subscribe(compare => this.updateCompare(compare));
        return response;
      })
    );
  }

  removeFromCompare(productId: string): Observable<any> {
    if (!productId) throw new Error('Product ID is required');
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.delete(`${this.apiUrl}/compare/${productId}`, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      map(response => {
        this.notifyCompareListUpdated();
        this.getCompareItems().subscribe(compare => this.updateCompare(compare));
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
      tap(() => {
        this.updateCompare([]); // Reset ngay lập tức
        this.notifyCompareListUpdated();
      })
    );
  }

  getCompareItems(): Observable<string[]> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.get<string[]>(`${this.apiUrl}/compare`, { headers, withCredentials: true }).pipe(
      catchError(err => {
        console.error('Error fetching compare items:', err);
        return of([]); // Trả về mảng rỗng nếu lỗi
      })
    );
  }

  updateCart(cart: any[]): void {
    this.cartSubject.next(cart);
  }

  updateCompare(compare: string[]): void {
    this.compareSubject.next(compare);
  }

  combineLatest(observables: Observable<Product | null>[]): Observable<Product[]> {
    return combineLatest(observables).pipe(
      map(results => results.filter(p => p !== null) as Product[])
    );
  }
}