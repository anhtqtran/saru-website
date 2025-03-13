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

  //load khuyến mãi
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

  // Tạo mới khuyến mãi hoặc voucher
  createItem(url: string, data: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const requestOptions = { headers: headers };
    return this._http.post(`${this.baseUrl}${url}`, data, requestOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  //xóa khuyến mãi
  deleteItem(id: string, type: 'promotion' | 'voucher'): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    const requestOptions = { headers: headers };
    const url = type === 'promotion' ? `${this.promotionsDeleteUrl}/${id}` : `${this.vouchersDeleteUrl}/${id}`;
    
    return this._http.delete(url, requestOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  //kết thúc khuyến mãi sớm
  endItem(id: string, type: 'promotion' | 'voucher'): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    const requestOptions = { headers: headers };
    const url = type === 'promotion' ? `${this.promotionsDeleteUrl}/${id}/end` : `${this.vouchersDeleteUrl}/${id}/end`;
    
    return this._http.put(url, {}, requestOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  // Lấy chi tiết một khuyến mãi dựa trên ID và type
  getItemById(id: string, type: 'promotion' | 'voucher'): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const requestOptions = { headers: headers };
    const url = type === 'promotion' ? `${this.promotionsDeleteUrl}/${id}` : `${this.vouchersDeleteUrl}/${id}`;

    return this._http.get<any>(url, requestOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  // Cập nhật dữ liệu khuyến mãi
  updateItem(id: string, type: 'promotion' | 'voucher', data: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const requestOptions = { headers: headers };
    const url = type === 'promotion' ? `${this.promotionsDeleteUrl}/${id}` : `${this.vouchersDeleteUrl}/${id}`;

    return this._http.put(url, data, requestOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  //kiểm tra lỗi
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