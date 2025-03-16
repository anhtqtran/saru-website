import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, throwError, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OrderServiceService {
  private apiUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<any[]> {
    return forkJoin({
      orders: this.http.get<any[]>(`${this.apiUrl}/orders`).pipe(
        catchError(error => {
          console.error('Lỗi khi lấy danh sách đơn hàng:', error);
          return throwError(() => new Error('Không thể tải danh sách đơn hàng: ' + error.message));
        })
      ),
      orderStatuses: this.http.get<any[]>(`${this.apiUrl}/order-status`).pipe(
        catchError(error => {
          console.error('Lỗi khi lấy trạng thái đơn hàng:', error);
          return throwError(() => new Error('Không thể tải trạng thái đơn hàng: ' + error.message));
        })
      ),
      paymentStatuses: this.http.get<any[]>(`${this.apiUrl}/payment-status`).pipe(
        catchError(error => {
          console.error('Lỗi khi lấy trạng thái thanh toán:', error);
          return throwError(() => new Error('Không thể tải trạng thái thanh toán: ' + error.message));
        })
      ),
      paymentMethods: this.http.get<any[]>(`${this.apiUrl}/payment-methods`).pipe(
        catchError(error => {
          console.error('Lỗi khi lấy phương thức thanh toán:', error);
          return throwError(() => new Error('Không thể tải phương thức thanh toán: ' + error.message));
        })
      ),
      customers: this.http.get<any[]>(`${this.apiUrl}/customers`).pipe(
        catchError(error => {
          console.error('Lỗi khi lấy thông tin khách hàng:', error);
          return throwError(() => new Error('Không thể tải thông tin khách hàng: ' + error.message));
        })
      ),
    }).pipe(
      map(({ orders, orderStatuses, paymentStatuses, paymentMethods, customers }) => {
        const statusMap = orderStatuses.reduce((acc: { [key: number]: string }, status: any) => {
          acc[status.OrderStatusID] = status.Status;
          return acc;
        }, {});
        const paymentStatusMap = paymentStatuses.reduce((acc: { [key: string]: string }, status: any) => {
          acc[status.PaymentStatusID] = status.PaymentStatus;
          return acc;
        }, {});
        const paymentMethodMap = paymentMethods.reduce((acc: { [key: string]: string }, method: any) => {
          acc[method.PaymentMethodID] = method.PaymentMethod;
          return acc;
        }, {});
        const customerMap = customers.reduce((acc: { [key: string]: any }, customer: any) => {
          acc[customer.CustomerID] = {
            CustomerName: customer.CustomerName || 'Không xác định',
            CustomerAdd: customer.CustomerAdd || { address: '', city: '', state: '' },
            CustomerPhone: customer.CustomerPhone || '',
          };
          return acc;
        }, {});

        return orders.map(order => {
          const totalOrderAmount = order.items?.reduce((sum: number, item: any) => sum + (item.TotalPrice || 0), 0) || 0;
          return {
            ...order,
            OrderStatusText: statusMap[order.OrderStatusID] || 'Không xác định',
            PaymentStatusText: paymentStatusMap[order.PaymentStatusID] || 'Không xác định',
            PaymentMethodText: paymentMethodMap[order.PaymentMethodID] || 'Không xác định',
            CustomerName: customerMap[order.CustomerID]?.CustomerName || 'Không xác định',
            CustomerAdd: customerMap[order.CustomerID]?.CustomerAdd || { address: '', city: '', state: '' },
            CustomerPhone: customerMap[order.CustomerID]?.CustomerPhone || '',
            TotalOrderAmount: totalOrderAmount,
            Points: Math.floor(totalOrderAmount / 1000), // Tính điểm tích lũy
          };
        });
      }),
      catchError(this.handleError)
    );
  }

  getOrderById(orderId: string): Observable<any> {
    if (!orderId) {
      console.error('orderId không hợp lệ: ', orderId);
      return throwError(() => new Error('orderId không được để trống'));
    }
  
    console.log(`Gọi API getOrderById với ID: ${orderId} (Kiểu: ${typeof orderId})`);
    return this.http.get<any>(`${this.apiUrl}/orders/${orderId}`).pipe(
      switchMap(order => {
        if (!order.CustomerID) {
          console.error(`Đơn hàng ${orderId} không có CustomerID`);
          const totalOrderAmount = order.items?.reduce((sum: number, item: any) => sum + (item.TotalPrice || 0), 0) || 0;
          return of({
            ...order,
            CustomerName: 'Không xác định',
            CustomerAdd: { address: '', city: '', state: '' },
            CustomerPhone: '',
            TotalOrderAmount: totalOrderAmount,
            VoucherID: order.VoucherID || '',
            VoucherDiscount: order.VoucherDiscount || 0,
            VoucherDetails: order.VoucherDetails || null,
          });
        }
  
        return this.http.get<any>(`${this.apiUrl}/customers/${order.CustomerID}`).pipe(
          map(customer => {
            console.log(`Thông tin khách hàng cho đơn hàng ${orderId}:`, customer);
            const totalOrderAmount = order.items?.reduce((sum: number, item: any) => sum + (item.TotalPrice || 0), 0) || 0;
            return {
              ...order,
              CustomerName: customer.CustomerName || 'Không xác định',
              CustomerAdd: customer.CustomerAdd || { address: '', city: '', state: '' },
              CustomerPhone: customer.CustomerPhone || '',
              TotalOrderAmount: totalOrderAmount,
              VoucherID: order.VoucherID || '',
              VoucherDiscount: order.VoucherDiscount || 0,
              VoucherDetails: order.VoucherDetails || null,
            };
          }),
          catchError(err => {
            console.error(`Lỗi khi lấy thông tin khách hàng cho đơn hàng ${orderId}:`, err);
            const totalOrderAmount = order.items?.reduce((sum: number, item: any) => sum + (item.TotalPrice || 0), 0) || 0;
            return of({
              ...order,
              CustomerName: 'Không xác định',
              CustomerAdd: { address: '', city: '', state: '' },
              CustomerPhone: '',
              TotalOrderAmount: totalOrderAmount,
              VoucherID: order.VoucherID || '',
              VoucherDiscount: order.VoucherDiscount || 0,
              VoucherDetails: order.VoucherDetails || null,
            });
          })
        );
      }),
      catchError(error => {
        console.error(`Lỗi khi lấy chi tiết đơn hàng ${orderId}:`, error);
        return throwError(() => new Error(`Không thể tải chi tiết đơn hàng ${orderId}: ${error.message}`));
      })
    );
  }

  getVouchers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vouchers`).pipe(
      catchError(error => {
        console.error('Lỗi khi lấy danh sách voucher:', error);
        return throwError(() => new Error('Không thể tải danh sách voucher: ' + error.message));
      })
    );
  }

  updateOrder(orderId: string, orderData: any): Observable<any> {
    if (!orderId) {
      console.error('orderId không hợp lệ: ', orderId);
      return throwError(() => new Error('orderId không được để trống'));
    }

    const filteredOrderData: any = {};
    if (orderData.OrderID) filteredOrderData.OrderID = orderData.OrderID;
    if (orderData.CustomerID) filteredOrderData.CustomerID = orderData.CustomerID;
    if (orderData.OrderStatusID !== undefined) filteredOrderData.OrderStatusID = orderData.OrderStatusID;
    if (orderData.OrderStatusText) filteredOrderData.OrderStatusText = orderData.OrderStatusText;
    if (orderData.PaymentStatusID !== undefined) filteredOrderData.PaymentStatusID = orderData.PaymentStatusID;
    if (orderData.PaymentStatusText) filteredOrderData.PaymentStatusText = orderData.PaymentStatusText;
    if (orderData.PaymentMethodID) filteredOrderData.PaymentMethodID = orderData.PaymentMethodID;
    if (orderData.OrderDate) filteredOrderData.OrderDate = orderData.OrderDate;
    if (orderData.OrderNote) filteredOrderData.OrderNote = orderData.OrderNote;
    if (orderData.ShippingFee !== undefined) filteredOrderData.ShippingFee = orderData.ShippingFee;
    if (orderData.Warehouse) filteredOrderData.Warehouse = orderData.Warehouse;
    if (orderData.ShippingCode) filteredOrderData.ShippingCode = orderData.ShippingCode;
    if (orderData.ShippingProvider) filteredOrderData.ShippingProvider = orderData.ShippingProvider;
    if (orderData.TrackingNumber) filteredOrderData.TrackingNumber = orderData.TrackingNumber;
    if (orderData.TotalWeight) filteredOrderData.TotalWeight = orderData.TotalWeight;
    if (orderData.ShippingStatus) filteredOrderData.ShippingStatus = orderData.ShippingStatus;
    if (orderData.IsVerified !== undefined) filteredOrderData.IsVerified = orderData.IsVerified;
    if (orderData.CustomerNote) filteredOrderData.CustomerNote = orderData.CustomerNote;
    if (orderData.VoucherID) filteredOrderData.VoucherID = orderData.VoucherID;
    if (orderData.VoucherValue !== undefined) filteredOrderData.VoucherValue = orderData.VoucherValue;
    if (orderData.VoucherDiscount !== undefined) filteredOrderData.VoucherDiscount = orderData.VoucherDiscount;
    if (orderData.TotalOrderAmount !== undefined) filteredOrderData.TotalOrderAmount = orderData.TotalOrderAmount;
    if (orderData.Subtotal !== undefined) filteredOrderData.Subtotal = orderData.Subtotal;
    if (orderData.Points !== undefined) filteredOrderData.Points = orderData.Points;

    console.log(`Gọi API updateOrder với ID: ${orderId} (Kiểu: ${typeof orderId}), Data:`, filteredOrderData);

    return this.http.put<any>(`${this.apiUrl}/orders/${orderId}`, filteredOrderData).pipe(
      tap(response => console.log('Cập nhật thành công:', response)),
      catchError(error => {
        console.error(`Lỗi khi cập nhật đơn hàng ${orderId}:`, error);
        return throwError(() => new Error(`Không thể cập nhật đơn hàng ${orderId}: ${error.message}`));
      })
    );
  }

  updateShipping(orderId: string, shippingData: any): Observable<any> {
    if (!orderId) {
      console.error('orderId không hợp lệ: ', orderId);
      return throwError(() => new Error('orderId không được để trống'));
    }

    const filteredShippingData: any = {};
    if (shippingData.ShippingCode) filteredShippingData.ShippingCode = shippingData.ShippingCode;
    if (shippingData.TrackingNumber) filteredShippingData.TrackingNumber = shippingData.TrackingNumber;
    if (shippingData.ShippingStatus) filteredShippingData.ShippingStatus = shippingData.ShippingStatus;

    console.log(`Gọi API updateShipping với ID: ${orderId} (Kiểu: ${typeof orderId}), Data:`, filteredShippingData);

    return this.http.put<any>(`${this.apiUrl}/orders/${orderId}/shipping`, filteredShippingData).pipe(
      tap(response => console.log('Cập nhật vận đơn thành công:', response)),
      catchError(error => {
        console.error(`Lỗi khi cập nhật vận đơn cho đơn hàng ${orderId}:`, error);
        return throwError(() => new Error(`Không thể cập nhật vận đơn cho đơn hàng ${orderId}: ${error.message}`));
      })
    );
  }

  deleteOrder(orderId: string): Observable<any> {
    if (!orderId) {
      console.error('orderId không hợp lệ: ', orderId);
      return throwError(() => new Error('orderId không được để trống'));
    }

    console.log(`Gọi API deleteOrder với ID: ${orderId} (Kiểu: ${typeof orderId})`);
    return this.http.delete<any>(`${this.apiUrl}/orders/${orderId}`).pipe(
      tap(() => console.log(`Xóa đơn hàng ${orderId} thành công`)),
      catchError(error => {
        if (error.status === 404) {
          console.log(`Đơn hàng ${orderId} đã được xóa trước đó hoặc không tồn tại`);
          return of({ success: true, message: `Đơn hàng ${orderId} đã được xóa` });
        }
        console.error(`Lỗi khi xóa đơn hàng ${orderId}:`, error);
        return throwError(() => new Error(`Không thể xóa đơn hàng ${orderId}: ${error.message}`));
      })
    );
  }

  addOrder(orderData: any): Observable<any> {
    const filteredOrderData: any = {};
    if (orderData.OrderID) filteredOrderData.OrderID = orderData.OrderID;
    if (orderData.CustomerID) filteredOrderData.CustomerID = orderData.CustomerID;
    if (orderData.OrderStatusID !== undefined) filteredOrderData.OrderStatusID = orderData.OrderStatusID;
    if (orderData.PaymentStatusID !== undefined) filteredOrderData.PaymentStatusID = orderData.PaymentStatusID;
    if (orderData.PaymentMethodID) filteredOrderData.PaymentMethodID = orderData.PaymentMethodID;
    if (orderData.OrderDate) filteredOrderData.OrderDate = orderData.OrderDate;
    if (orderData.OrderNote) filteredOrderData.OrderNote = orderData.OrderNote;
    if (orderData.ShippingFee) filteredOrderData.ShippingFee = orderData.ShippingFee;
    if (orderData.Warehouse) filteredOrderData.Warehouse = orderData.Warehouse;
    if (orderData.ShippingCode) filteredOrderData.ShippingCode = orderData.ShippingCode;
    if (orderData.ShippingProvider) filteredOrderData.ShippingProvider = orderData.ShippingProvider;
    if (orderData.TrackingNumber) filteredOrderData.TrackingNumber = orderData.TrackingNumber;
    if (orderData.TotalWeight) filteredOrderData.TotalWeight = orderData.TotalWeight;
    if (orderData.ShippingStatus) filteredOrderData.ShippingStatus = orderData.ShippingStatus;
    if (orderData.IsVerified) filteredOrderData.IsVerified = orderData.IsVerified;
    if (orderData.CustomerNote) filteredOrderData.CustomerNote = orderData.CustomerNote;
    if (orderData.VoucherID) filteredOrderData.VoucherID = orderData.VoucherID;
    if (orderData.VoucherValue) filteredOrderData.VoucherValue = orderData.VoucherValue;

    console.log('Gọi API addOrder với Data:', filteredOrderData);
    return this.http.post<any>(`${this.apiUrl}/orders`, filteredOrderData).pipe(
      catchError(error => {
        console.error('Lỗi khi tạo đơn hàng:', error);
        return throwError(() => new Error('Không thể tạo đơn hàng: ' + error.message));
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Lỗi API:', error);
    let errorMessage = 'Lỗi không xác định từ server';
    if (error.status === 404) {
      errorMessage = 'Đơn hàng không tồn tại hoặc không thể cập nhật.';
    } else if (error.status === 400) {
      errorMessage = 'Dữ liệu không hợp lệ: ' + (error.error?.message || error.message);
    } else {
      errorMessage = error.error?.message || error.message || 'Lỗi không xác định từ server';
    }
    return throwError(() => new Error(errorMessage));
  }
}