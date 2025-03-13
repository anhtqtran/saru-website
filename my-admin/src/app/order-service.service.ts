import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, retry, throwError, forkJoin } from 'rxjs';

export interface Order {
  _id: string;
  OrderID: string;
  CustomerID: string;
  OrderDate: string;
  OrderStatusID: number;
  OrderStatusText?: string;
  PaymentStatusID: number;
  PaymentStatus: string;
  Amount: number;
}

interface OrderStatus {
  _id: string;
  OrderStatusID: number;
  Status: string;
}

interface PaymentStatus {
  _id: string;
  PaymentStatusID: number;
  PaymentStatus: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  apiUrl = 'http://localhost:4002/orders';
  statusUrl = 'http://localhost:4002/order-status';
  paymentStatusUrl = 'http://localhost:4002/payment-status';
  orderdetailsUrl = 'http://localhost:4002/order-details';

  private statusMap: { [key: string]: string } = {
    "0": "Chờ xác nhận",
    "1": "Đã xác nhận",
    "2": "Đang vận chuyển",
    "3": "Giao hàng thành công",
    "4": "Đã hủy đơn",
  };

  constructor(private _http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return forkJoin({
      orders: this._http.get<Order[]>(this.apiUrl).pipe(retry(3)),
      statuses: this._http.get<OrderStatus[]>(this.statusUrl).pipe(retry(3)),
      paymentStatuses: this._http.get<PaymentStatus[]>(this.paymentStatusUrl).pipe(retry(3)),
    }).pipe(
      map(({ orders, statuses, paymentStatuses }) => {
        const statusMap = statuses.reduce((acc, status) => {
          acc[status.OrderStatusID] = status.Status;
          return acc;
        }, {} as { [key: number]: string });

        const paymentStatusMap = paymentStatuses.reduce((acc, status) => {
          acc[status.PaymentStatusID] = status.PaymentStatus;
          return acc;
        }, {} as { [key: number]: string });

        return orders.map(order => ({
          ...order,
          OrderStatusText: statusMap[order.OrderStatusID] || "Không xác định",
          PaymentStatusText: paymentStatusMap[order.PaymentStatusID] || "Không xác định",
        }));
      }),
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message));
  }

  deleteOrder(OrderID: string): Observable<any> {
    console.log("Gửi request xóa đơn hàng:", `${this.apiUrl}/${OrderID}`);
    return this._http.delete<any>(`${this.apiUrl}/${OrderID}`).pipe(
      catchError(error => {
        console.error("Lỗi khi xóa đơn hàng:", error);
        return this.handleError(error);
      })
    );
  }

  addOrder(orderData: any): Observable<any> {
    console.log("Gửi request tạo đơn hàng:", orderData);
    return this._http.post<any>(`${this.apiUrl}`, orderData).pipe(
      catchError(error => {
        console.error("Lỗi khi tạo đơn hàng:", error);
        return this.handleError(error);
      })
    );
  }

  getOrderById(orderId: string): Observable<any> {
    console.log("Gửi request lấy chi tiết đơn hàng:", `${this.apiUrl}/${orderId}`);
    return this._http.get<any>(`${this.apiUrl}/${orderId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateOrder(orderId: string, orderData: any): Observable<any> {
    console.log("Gửi request cập nhật đơn hàng:", `${this.apiUrl}/${orderId}`, orderData);
    return this._http.put<any>(`${this.apiUrl}/${orderId}`, orderData).pipe(
      catchError(error => {
        console.error("Lỗi khi cập nhật đơn hàng:", error);
        return this.handleError(error);
      })
    );
  }

  // Lấy dữ liệu gộp từ /combined-data
  getCombinedData(): Observable<any> {
    return this._http.get<any>(`${this.apiUrl}/combined-data`).pipe(
      catchError(this.handleError)
    );
  }
}