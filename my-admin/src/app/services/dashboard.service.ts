import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://api.example.com/dashboard'; // Thay bằng URL API thực tế

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<any> {
    return of({
      listingCount: 150,
      pendingOrders: 30,
      messagesCount: 5,
      totalSales: 1500,
      salesChange: '+500',
      totalIncome: 25000000,
      incomeChange: '+5000000',
      conversionRate: '11.8',
      rateChange: '2.0',
      salesData: {
        labels: [],
        datasets: [],
      },
      categoriesData: {
        labels: ['Electronics', 'Furniture', 'Toys'],
        data: [50, 30, 20],
      },
    });
  }
}