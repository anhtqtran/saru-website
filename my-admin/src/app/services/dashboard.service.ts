import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Định nghĩa các interface cho dữ liệu trả về từ API
interface OverviewData {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

interface SalesData {
  weeklyRevenue: number;
  weeklyOrders: number;
  bestSellingProducts: { _id: string; productName: string; totalQuantity: number }[];
  bestSellingCategories: { _id: string; categoryName: string; totalQuantity: number }[];
}

interface OrderStats {
  newOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

interface CustomerStats {
  newCustomers: number;
  topCustomers: { customerName: string; totalAmount: number }[];
  recentCustomers: { customerName: string; OrderDate: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://localhost:4000/api/dashboard'; // URL API backend

  constructor(private http: HttpClient) {}

  // Lấy dữ liệu tổng quan
  getOverviewData(): Observable<OverviewData> {
    return this.http.get<OverviewData>(`${this.apiUrl}/overview`);
  }

  // Lấy dữ liệu hiệu suất bán hàng
  getSalesData(): Observable<SalesData> {
    return this.http.get<SalesData>(`${this.apiUrl}/sales`);
  }

  // Lấy thông tin thống kê đơn hàng
  getOrderStats(): Observable<OrderStats> {
    return this.http.get<OrderStats>(`${this.apiUrl}/orders`);
  }

  // Lấy thông tin thống kê khách hàng
  getCustomerStats(): Observable<CustomerStats> {
    return this.http.get<CustomerStats>(`${this.apiUrl}/customers`);
  }
}