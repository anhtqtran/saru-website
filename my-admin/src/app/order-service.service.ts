import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, retry, throwError, forkJoin } from 'rxjs';
import { order } from './models/order';
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
  providedIn: 'root'
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
    "4": "Đã hủy đơn"
  };

  constructor(private _http: HttpClient) { }

  getOrders(): Observable<Order[]> {
    return forkJoin({
      orders: this._http.get<Order[]>(this.apiUrl).pipe(retry(3)),
      statuses: this._http.get<OrderStatus[]>(this.statusUrl).pipe(retry(3)),
      paymentStatuses: this._http.get<PaymentStatus[]>(this.paymentStatusUrl).pipe(retry(3))
    }).pipe(
      map(({ orders, statuses, paymentStatuses }) => {
        // Chuyển danh sách trạng thái thành object để tra cứu nhanh
        const statusMap = statuses.reduce((acc, status) => {
          acc[status.OrderStatusID] = status.Status; // Map StatusID -> Status
          return acc;
        }, {} as { [key: number]: string });

        // Tạo map để tra cứu trạng thái thanh toán
        const paymentStatusMap = paymentStatuses.reduce((acc, status) => {
          acc[status.PaymentStatusID] = status.PaymentStatus;
          return acc;
        }, {} as { [key: number]: string });

        // Ánh xạ OrderStatusID thành OrderStatusText
        return orders.map(order => ({
          ...order,
          OrderStatusText: statusMap[order.OrderStatusID] || "Không xác định",
          PaymentStatusText: paymentStatusMap[order.PaymentStatusID] || "Không xác định"
        }));
      }),
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message));
  }   

  // Xóa Fashion
  deleteOrder(OrderID: string): Observable<any> {
  console.log("Gửi request xóa đơn hàng:", `${this.apiUrl}/${OrderID}`);
  return this._http.delete<any>(`${this.apiUrl}/${OrderID}`).pipe(
    catchError(error => {
      console.error("Lỗi khi xóa đơn hàng:", error);
      return this.handleError(error);
    })
  );
  }
//Thêm đơn hàng mới
  addOrder(orderData: any): Observable<any> {
    console.log("Gửi request tạo đơn hàng:", orderData);
    return this._http.post<any>(`${this.apiUrl}`, orderData).pipe(
      catchError(error => {
        console.error("Lỗi khi tạo đơn hàng:", error);
        return this.handleError(error);
      })
    );
  }
  //lấy đơn hàng chi tiết theo Id
  getOrderById(orderId: string): Observable<any> {
    console.log("Gửi request lấy chi tiết đơn hàng:", `${this.apiUrl}/${orderId}`);
    return this._http.get<any>(`${this.apiUrl}/${orderId}`).pipe(
      catchError(this.handleError)
    );
  }  
  
  
}
