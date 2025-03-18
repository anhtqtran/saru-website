import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap, map, switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { BestSellingProduct } from '../classes/BestSellingProduct';
import { Product } from '../classes/Product'; // Import the Product interface
import { Subject } from 'rxjs';
// Định nghĩa kiểu dữ liệu tạm thời cho response từ API
interface BestSellerDetailResponse {
  _id: any;
  productId: string;
  productName: string;
  productPrice: number;
  productImageCover: string;
  categoryName: string;
  totalQuantity: number;
  averageRating: number;
  reviewCount: number;
  reviews?: any[];
  description?: string;
  relatedProducts?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class HomepageProductsService {
  private apiUrl = 'http://localhost:4000/api';
  private loading = false;
  private compareListUpdated = new Subject<void>();

  constructor(private http: HttpClient) {}

  getBestSellers(): Observable<BestSellingProduct[]> {
    if (this.loading) {
      return of([]); // Trả về mảng rỗng nếu đang tải để tránh gọi trùng
    }

    this.loading = true;
    return this.http.get<BestSellingProduct[]>(`${this.apiUrl}/products/best-selling`).pipe(
      retry(2),
      tap((products) => console.log('Best sellers raw data:', products)), // Log để debug
      tap(() => this.loading = false),
      catchError((error: HttpErrorResponse) => {
        this.loading = false;
        console.error('HTTP Error in getBestSellers:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error
        });
        return throwError(() => new Error('Không thể lấy dữ liệu sản phẩm bán chạy.'));
      })
    );
  }

  getBestSellerIds(): Observable<string[]> {
    if (this.loading) {
      return of([]); // Trả về mảng rỗng nếu đang tải để tránh gọi trùng
    }

    this.loading = true;
    return this.getBestSellers().pipe(
      map(products => products.map(product => product.productId)),
      tap((ids) => console.log('Best seller IDs loaded:', ids)),
      tap(() => this.loading = false),
      catchError((error: HttpErrorResponse) => {
        this.loading = false;
        console.error('HTTP Error in getBestSellerIds:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error
        });
        return throwError(() => new Error('Không thể lấy ID sản phẩm bán chạy.'));
      })
    );
  }

  getBestSellerDetail(productId: string): Observable<BestSellingProduct> {
    if (this.loading) {
      return throwError(() => new Error('Service is currently loading, please try again later.'));
    }

    this.loading = true;
    console.log('Calling getBestSellerDetail with productId:', productId); // Debug log
    return this.http.get<BestSellerDetailResponse>(`${this.apiUrl}/products/best-seller-detail/${productId}`).pipe(
      retry(2),
      map(response => {
        if (!response) {
          throw new Error('Dữ liệu từ API không hợp lệ.');
        }

        return {
          _id: response._id || null,
          productId: response.productId || '',
          productName: response.productName || '',
          productPrice: response.productPrice || 0,
          productImageCover: response.productImageCover || 'assets/images/default-product.png',
          categoryName: response.categoryName || 'Không có danh mục',
          totalQuantity: response.totalQuantity || 0,
          averageRating: response.averageRating || 0,
          reviewCount: response.reviewCount || 0,
          reviews: Array.isArray(response.reviews) ? response.reviews : [],
          description: response.description || '',
          relatedProducts: Array.isArray(response.relatedProducts) ? response.relatedProducts : []
        } as BestSellingProduct;
      }),
      tap((product) => {
        console.log('Best seller detail loaded:', product); // Log để debug
        if (!product._id || !product.productId) {
          console.warn('Dữ liệu best seller thiếu trường quan trọng:', product);
        }
      }),
      tap(() => this.loading = false),
      catchError((error: HttpErrorResponse) => {
        this.loading = false;
        const errorMessage = `Không thể tải chi tiết sản phẩm best seller với ID ${productId}. 
          Mã lỗi: ${error.status} - ${error.statusText} - ${error.message}`;
        console.error('HTTP Error for best seller detail:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error
        });
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getObjectIdFromProductId(productId: string): Observable<string> {
    console.log('Mapping productId to _id:', productId); // Debug log
    return this.http.get<{ _id: string }>(`${this.apiUrl}/products/map-id/${productId}`).pipe(
      map(response => {
        if (!response || !response._id) {
          throw new Error('Không tìm thấy _id cho productId.');
        }
        console.log('Mapped _id:', response._id); // Debug log
        return response._id;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error mapping product ID to ObjectId:', {
          productId,
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error
        });
        // Fallback: Thử gọi trực tiếp endpoint /api/products/:productId nếu map-id thất bại
        if (error.status === 404) {
          console.warn('Falling back to direct product lookup with productId:', productId);
          return this.http.get<{ _id: string }>(`${this.apiUrl}/products/${productId}`).pipe(
            map(response => {
              if (!response || !response._id) {
                throw new Error('Không tìm thấy _id trong fallback.');
              }
              console.log('Fallback _id:', response._id);
              return response._id;
            }),
            catchError((fallbackError: HttpErrorResponse) => {
              console.error('Fallback error:', fallbackError);
              return throwError(() => new Error(`Không thể ánh xạ ID sản phẩm ${productId} sang ObjectId. Mã lỗi: ${fallbackError.status}`));
            })
          );
        }
        return throwError(() => new Error(`Không thể ánh xạ ID sản phẩm ${productId} sang ObjectId. Mã lỗi: ${error.status}`));
      })
    );
  }

  get isLoading(): boolean {
    return this.loading;
  }

  // // Compare functions
  // getCompareItems(): Observable<string[]> {
  //   return this.http.get<string[]>(`${this.apiUrl}/compare-items`).pipe(
  //     map(items => {
  //       if (!Array.isArray(items)) {
  //         console.warn('Invalid response from compare-items: Expected array, got:', items);
  //         return [];
  //       }
  //       return items.filter(item => typeof item === 'string' && item.trim() !== '');
  //     }),
  //     tap(items => console.log('Compare items loaded:', items)),
  //     catchError(this.handleError('getCompareItems', 'Không thể lấy danh sách compare', []))
  //   );
  // }

  getProductDetail(id: string): Observable<Product | null> {
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      console.warn('Invalid ObjectId:', id);
      return of(null);
    }
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      tap(product => console.log('Product detail loaded:', product)),
      catchError(this.handleError(`getProductDetail(${id})`, 'Không thể tải sản phẩm', null))
    );
  }

  combineLatest(observables: Observable<Product | null>[]): Observable<Product[]> {
    return combineLatest(observables).pipe(
      map(products => products.filter(p => p !== null) as Product[])
    );
  }

  addToCompare(productId: string): Observable<{ success: boolean; message: string }> {
    return this.getObjectIdFromProductId(productId).pipe(
      switchMap(_id => {
        if (!_id) return of({ success: false, message: 'Invalid product ID' });
        return this.http.post<{ message: string; compareList: { productId: string; isBestSeller: boolean }[] }>(
          `${this.apiUrl}/compare`,
          { productId: _id, isBestSeller: true },
          { headers: { 'Content-Type': 'application/json' } }
        ).pipe(
          map(response => ({ success: true, message: response.message })),
          catchError(error => {
            console.error('Error adding to compare:', error);
            return of({ success: false, message: error.error?.error || 'Failed to add to compare' });
          })
        );
      })
    );
  }

  removeFromCompare(productId: string): Observable<{ success: boolean; message: string }> {
    return this.getObjectIdFromProductId(productId).pipe(
      switchMap(_id => {
        if (!_id) return of({ success: false, message: 'Invalid product ID' });
        return this.http.delete<{ message: string; compareList: { productId: string; isBestSeller: boolean }[] }>(
          `${this.apiUrl}/compare/${_id}?isBestSeller=true`,
          { headers: { 'Content-Type': 'application/json' } }
        ).pipe(
          map(response => ({ success: true, message: response.message })),
          catchError(error => {
            console.error('Error removing from compare:', error);
            return of({ success: false, message: error.error?.error || 'Failed to remove from compare' });
          })
        );
      })
    );
  }

  removeAllFromCompare(): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ message: string; compareList: { productId: string; isBestSeller: boolean }[] }>(
      `${this.apiUrl}/compare/all`,
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      map(response => ({ success: true, message: response.message })),
      catchError(error => {
        console.error('Error clearing all compare items:', error);
        return of({ success: false, message: error.error?.error || 'Failed to clear compare list' });
      })
    );
  }


  notifyCompareListUpdated(): void {
    this.compareListUpdated.next();
  }

  onCompareListUpdated(): Observable<void> {
    return this.compareListUpdated.asObservable();
  }

  private handleError<T>(operation: string, message: string, defaultValue?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`Error in ${operation}:`, {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error
      });
      return defaultValue !== undefined
        ? of(defaultValue)
        : throwError(() => new Error(`${message}. Mã lỗi: ${error.status}`));
    };
  }
  }
  
