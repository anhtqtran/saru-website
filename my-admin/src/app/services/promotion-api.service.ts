import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { Promotion, Voucher, PromotionStatus, VoucherStatus, Category } from '../classes/Promotion';

@Injectable({
  providedIn: 'root'
})
export class PromotionApiService {
  private baseUrl = 'http://localhost:4000';
  private combinedDataUrl = `${this.baseUrl}/combined-data-promotions`;
  private promotionsDeleteUrl = `${this.baseUrl}/promotions`;
  private vouchersDeleteUrl = `${this.baseUrl}/vouchers`;

  constructor(private _http: HttpClient) { }

  // Load dữ liệu kết hợp (promotions, vouchers, promotionScopes, v.v.)
  getCombinedData(): Observable<{
    promotions: Promotion[];
    vouchers: Voucher[];
    promotionStatuses: PromotionStatus[];
    voucherStatuses: VoucherStatus[];
    promotionScopes: { SCOPEID: number; SCOPE: string }[]; // Đồng nhất với backend
    total: { promotions: number; vouchers: number };
  }> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    const requestOptions = { headers: headers };

    return this._http.get<any>(this.combinedDataUrl, requestOptions).pipe(
      map(res => ({
        promotions: res.promotions.map((p: any) => ({
          ...p,
          SCOPEID: p.SCOPEID !== undefined ? Number(p.SCOPEID) : 0, // Đồng nhất SCOPEID
          ScopeName: p.ScopeName || 'Toàn ngành hàng' // Giữ ScopeName
        })) as Promotion[],
        vouchers: res.vouchers.map((v: any) => ({
          ...v,
          SCOPEID: v.SCOPEID !== undefined ? Number(v.SCOPEID) : 0, // Đồng nhất SCOPEID
          ScopeName: v.ScopeName || 'Toàn ngành hàng' // Giữ ScopeName
        })) as Voucher[],
        promotionStatuses: res.promotionStatuses as PromotionStatus[],
        voucherStatuses: res.voucherStatuses as VoucherStatus[],
        promotionScopes: res.promotionScopes.map((scope: any) => ({
          SCOPEID: scope.SCOPEID, // Đồng nhất với backend
          SCOPE: scope.SCOPE // Đồng nhất với backend
        })) as { SCOPEID: number; SCOPE: string }[],
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

  // Xóa khuyến mãi hoặc voucher
  deleteItem(id: string, type: 'promotion' | 'voucher'): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    const requestOptions = { headers: headers };
    const url = type === 'promotion' ? `${this.promotionsDeleteUrl}/${id}` : `${this.vouchersDeleteUrl}/${id}`;
    
    return this._http.delete(url, requestOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  // Kết thúc sớm khuyến mãi hoặc voucher
  endItem(id: string, type: 'promotion' | 'voucher'): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    const requestOptions = { headers: headers };
    const url = type === 'promotion' ? `${this.promotionsDeleteUrl}/${id}/end` : `${this.vouchersDeleteUrl}/${id}/end`;
    
    return this._http.put(url, {}, requestOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  // Lấy chi tiết một khuyến mãi hoặc voucher dựa trên ID và type
  getItemById(id: string, type: 'promotion' | 'voucher'): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const requestOptions = { headers: headers };
    const url = type === 'promotion' ? `${this.promotionsDeleteUrl}/${id}` : `${this.vouchersDeleteUrl}/${id}`;

    return this._http.get<any>(url, requestOptions).pipe(
      map(item => ({
        ...item,
        SCOPEID: item.SCOPEID !== undefined ? Number(item.SCOPEID) : 0, // Đồng nhất SCOPEID
        ScopeName: item.ScopeName || 'Toàn ngành hàng' // Giữ ScopeName
      })),
      retry(3),
      catchError(this.handleError)
    );
  }

  // Cập nhật dữ liệu khuyến mãi hoặc voucher
  updateItem(id: string, type: 'promotion' | 'voucher', data: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const requestOptions = { headers: headers };
    const url = type === 'promotion' ? `${this.promotionsDeleteUrl}/${id}` : `${this.vouchersDeleteUrl}/${id}`;

    return this._http.put(url, data, requestOptions).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  // Xử lý lỗi
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