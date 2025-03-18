import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { BehaviorSubject, catchError, map, Observable, retry, throwError, combineLatest } from 'rxjs';
=======
import { BehaviorSubject, catchError, map, Observable, retry, throwError, combineLatest, of, tap, switchMap } from 'rxjs';
>>>>>>> main
import { Product, Pagination } from '../classes/Product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:4000/api';
  private compareListUpdated = new BehaviorSubject<void>(undefined);
<<<<<<< HEAD
  private cartSubject = new BehaviorSubject<any[]>([]); // Trạng thái giỏ hàng
  private compareSubject = new BehaviorSubject<string[]>([]); // Trạng thái danh sách so sánh

  // Observable để các component lắng nghe
  cart$ = this.cartSubject.asObservable();
  compare$ = this.compareSubject.asObservable();

  constructor(private http: HttpClient) {}

resetCartAndCompare(): void {
    // Không reset hoàn toàn, thay vào đó tải lại dữ liệu từ backend
=======
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
>>>>>>> main
    this.getCartItems().subscribe({
      next: (cart) => this.updateCart(cart),
      error: (err) => console.error('Error resetting cart:', err)
    });
    this.getCompareItems().subscribe({
      next: (compare) => this.updateCompare(compare),
      error: (err) => console.error('Error resetting compare:', err)
    });
  }

<<<<<<< HEAD
  // Phát tín hiệu khi danh sách so sánh thay đổi
  notifyCompareListUpdated(): void {
    this.compareListUpdated.next();
  }

  getCompareListUpdated(): Observable<void> {
    return this.compareListUpdated.asObservable();
  }
  
  // Observable để các component lắng nghe thay đổi
=======
  // Xử lý lỗi chung
>>>>>>> main
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Đã xảy ra lỗi không xác định!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi phía Client: ${error.error.message}`;
    } else {
      errorMessage = `Lỗi Server (Mã lỗi: ${error.status}): ${error.error?.error || error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

<<<<<<< HEAD
  // 1. Lấy danh sách sản phẩm (có bộ lọc và phân trang)
getProducts(filters: any = {}, page: number = 1, limit: number = 12): Observable<{
=======
  // Lấy danh sách sản phẩm
  getProducts(filters: any = {}, page: number = 1, limit: number = 12): Observable<{
>>>>>>> main
    data: Product[];
    pagination: Pagination
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

<<<<<<< HEAD
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
=======
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key].toString());
      }
    });
    return this.http.get<{ data: Product[]; pagination: Pagination }>(`${this.apiUrl}/products`, { params }).pipe(
>>>>>>> main
      catchError(this.handleError)
    );
  }

<<<<<<< HEAD
  // 3. Thêm sản phẩm vào giỏ hàng
  addToCart(productId: string, quantity: number = 1): Observable<any> {
=======
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
      map(async response => {
        if (!response) return null;
        if (response.relatedProducts && response.relatedProducts.length > 0) {
          return await this.enrichRelatedProducts(response);
        }
        return response;
      }),
      switchMap(promise => promise), // Chuyển Promise thành Observable
      catchError(err => {
        console.warn(`Product ${id} not found or error occurred:`, err);
        return of(null);
      })
    );
  }

  private async enrichRelatedProducts(product: Product): Promise<Product> {
    if (!product.relatedProducts || product.relatedProducts.length === 0) return product;

    const enrichedRelatedProducts = await Promise.all(
      product.relatedProducts.map(async related => {
        if (related._id && !related.ProductImageCover) {
          const imageData = await this.getImageForRelatedProduct(related._id).toPromise();
          return {
            ...related,
            ProductImageCover: imageData?.ProductImageCover || 'assets/images/default-product.png'
          };
        }
        return related;
      })
    );

    return {
      ...product,
      relatedProducts: enrichedRelatedProducts
    };
  }

  getImageForRelatedProduct(productId: string): Observable<any> {
    return this.http.get<{ ImageID: string }>(`${this.apiUrl}/products/${productId}`, { params: { fields: 'ImageID' } }).pipe(
      switchMap(product => this.getImage(product.ImageID)),
      catchError(() => of({ ProductImageCover: 'assets/images/default-product.png' }))
    );
  }

  // Thêm vào giỏ hàng
  addToCart(productId: string, quantity: number = 1): Observable<any> {
    if (!productId) throw new Error('Product ID is required');
>>>>>>> main
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    const body = { productId, quantity };

    return this.http.post(`${this.apiUrl}/cart`, body, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
<<<<<<< HEAD
      map(response => {
        this.getCartItems().subscribe(cart => this.updateCart(cart)); // Cập nhật sau khi thêm
        return response;
      })
    );
  }
  // 4. Xóa sản phẩm khỏi giỏ hàng
  removeFromCart(productId: string): Observable<any> {
=======
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
>>>>>>> main
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.delete(`${this.apiUrl}/cart/${productId}`, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
<<<<<<< HEAD
      map(response => {
        this.getCartItems().subscribe(cart => this.updateCart(cart)); // Cập nhật sau khi xóa
        return response;
=======
      tap(() => {
        this.getCartItems().subscribe({
          next: (cart) => this.updateCart(cart),
          error: (err) => console.error('Error updating cart after remove:', err)
        });
>>>>>>> main
      })
    );
  }

<<<<<<< HEAD
  // 5. Lấy danh sách sản phẩm trong giỏ hàng
=======
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
>>>>>>> main
  getCartItems(): Observable<any[]> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/cart`, { headers, withCredentials: true }).pipe(
<<<<<<< HEAD
      catchError(this.handleError)
    );
  }

  // 6. Thêm sản phẩm vào danh sách so sánh
addToCompare(productId: string): Observable<any> {
=======
      catchError(err => {
        console.error('Error fetching cart items:', err);
        return of([]); // Trả về mảng rỗng nếu lỗi
      })
    );
  }

  // Thêm vào danh sách so sánh (giữ nguyên từ đoạn gốc)
  addToCompare(productId: string): Observable<any> {
>>>>>>> main
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
<<<<<<< HEAD
        this.getCompareItems().subscribe(compare => this.updateCompare(compare)); // Cập nhật sau khi thêm
=======
        this.getCompareItems().subscribe({
          next: (compare) => this.updateCompare(compare),
          error: (err) => console.error('Error updating compare after add:', err)
        });
>>>>>>> main
        return response;
      })
    );
  }

<<<<<<< HEAD
=======
  // Xóa khỏi danh sách so sánh (giữ nguyên từ đoạn gốc)
>>>>>>> main
  removeFromCompare(productId: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.delete(`${this.apiUrl}/compare/${productId}`, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      map(response => {
        this.notifyCompareListUpdated();
<<<<<<< HEAD
        this.getCompareItems().subscribe(compare => this.updateCompare(compare)); // Cập nhật sau khi xóa
=======
        this.getCompareItems().subscribe({
          next: (compare) => this.updateCompare(compare),
          error: (err) => console.error('Error updating compare after remove:', err)
        });
>>>>>>> main
        return response;
      })
    );
  }

<<<<<<< HEAD
removeAllFromCompare(): Observable<any> {
=======
  // Xóa toàn bộ danh sách so sánh (giữ nguyên từ đoạn gốc)
  removeAllFromCompare(): Observable<any> {
>>>>>>> main
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return this.http.delete(`${this.apiUrl}/compare/all`, { headers, withCredentials: true }).pipe(
      retry(1),
      catchError(this.handleError),
      map(response => {
        this.notifyCompareListUpdated();
<<<<<<< HEAD
        this.updateCompare([]); // Reset danh sách so sánh
=======
        this.updateCompare([]);
>>>>>>> main
        return response;
      })
    );
  }
<<<<<<< HEAD
=======

  // Lấy danh sách so sánh (giữ nguyên từ đoạn gốc)
>>>>>>> main
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

<<<<<<< HEAD
  combineLatest(observables: Observable<Product>[]): Observable<Product[]> {
    return combineLatest(observables).pipe(
      map(results => results)
=======
  // Kết hợp nhiều Observable
  combineLatest(observables: Observable<Product | null>[]): Observable<Product[]> {
    return combineLatest(observables).pipe(
      map(results => results.filter(p => p !== null) as Product[])
>>>>>>> main
    );
  }
}