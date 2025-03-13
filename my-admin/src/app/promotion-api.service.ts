import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { Promotion, Voucher, PromotionStatus, VoucherStatus, Category } from './classes/Promotion';

@Injectable({
  providedIn: 'root'
})
export class PromotionApiService {
  private baseUrl = 'http://localhost:4002';
  private combinedDataUrl = `${this.baseUrl}/combined-data`;
  private promotionsDeleteUrl = `${this.baseUrl}/promotions`;
  private vouchersDeleteUrl = `${this.baseUrl}/vouchers`;

  constructor(private _http: HttpClient) { }

  getCombinedData(): Observable<{
    promotions: Promotion[];
    vouchers: Voucher[];
    promotionStatuses: PromotionStatus[];
    voucherStatuses: VoucherStatus[];
    categories: Category[];
    total: { promotions: number; vouchers: number };
  }> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    const requestOptions = { headers: headers };

    return this._http.get<any>(this.combinedDataUrl, requestOptions).pipe(
      map(res => ({
        promotions: res.promotions as Promotion[],
        vouchers: res.vouchers as Voucher[],
        promotionStatuses: res.promotionStatuses as PromotionStatus[],
        voucherStatuses: res.voucherStatuses as VoucherStatus[],
        categories: res.categories as Category[],
        total: res.total as { promotions: number; vouchers: number }
      })),
      retry(3),
      catchError(this.handleError)
    );
  }

  deleteItem(id: string, type: 'promotion' | 'voucher'): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    const requestOptions = { headers: headers };
    const url = type === 'promotion' ? `${this.promotionsDeleteUrl}/${id}` : `${this.vouchersDeleteUrl}/${id}`;
    
    return this._http.delete(url, requestOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  endItem(id: string, type: 'promotion' | 'voucher'): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    const requestOptions = { headers: headers };
    const url = type === 'promotion' ? `${this.promotionsDeleteUrl}/${id}/end` : `${this.vouchersDeleteUrl}/${id}/end`;
    
    return this._http.put(url, {}, requestOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Đã xảy ra lỗi không xác định!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      errorMessage = `Mã lỗi: ${error.status}, Thông báo: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}