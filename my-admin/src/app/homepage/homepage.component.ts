import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent implements OnInit, AfterViewInit {
  dashboardData: any = {
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    weeklyRevenue: 0,
    weeklyOrders: 0,
    bestSellingProducts: [],
    bestSellingCategories: [],
    newOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    newCustomers: 0,
    topCustomers: [],
    recentCustomers: [],
  };

  salesChart: Chart | undefined;
  categoriesChart: Chart | undefined;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    Chart.register(...registerables);
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  loadDashboardData(): void {
    this.dashboardService.getOverviewData().subscribe({
      next: (data) => {
        this.dashboardData.totalProducts = data.totalProducts;
        this.dashboardData.totalOrders = data.totalOrders;
        this.dashboardData.totalCustomers = data.totalCustomers;
        this.dashboardData.totalRevenue = data.totalRevenue;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error fetching overview data:', error),
    });

    this.dashboardService.getSalesData().subscribe({
      next: (data) => {
        this.dashboardData.weeklyRevenue = data.weeklyRevenue;
        this.dashboardData.weeklyOrders = data.weeklyOrders;
        this.dashboardData.bestSellingProducts = data.bestSellingProducts;
        this.dashboardData.bestSellingCategories = data.bestSellingCategories;
        this.updateCharts();
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error fetching sales data:', error),
    });

    this.dashboardService.getOrderStats().subscribe({
      next: (data) => {
        this.dashboardData.newOrders = data.newOrders;
        this.dashboardData.processingOrders = data.processingOrders;
        this.dashboardData.completedOrders = data.completedOrders;
        this.dashboardData.cancelledOrders = data.cancelledOrders;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error fetching order stats:', error),
    });

    this.dashboardService.getCustomerStats().subscribe({
      next: (data) => {
        this.dashboardData.newCustomers = data.newCustomers;
        this.dashboardData.topCustomers = data.topCustomers;
        this.dashboardData.recentCustomers = data.recentCustomers;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error fetching customer stats:', error),
    });
  }

  updateCharts(): void {
    if (this.salesChart) this.salesChart.destroy();
    if (this.categoriesChart) this.categoriesChart.destroy();

    this.salesChart = new Chart('salesChart', {
      type: 'line',
      data: {
        labels: this.getWeekDays(),
        datasets: [
          {
            label: 'Doanh thu tuần này (VND)',
            data: Array(7).fill(this.dashboardData.weeklyRevenue / 7),
            borderColor: '#F8BC3B',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { position: 'top' } },
      },
    });

    this.categoriesChart = new Chart('categoriesChart', {
      type: 'pie',
      data: {
        labels: this.dashboardData.bestSellingCategories.map((cat: any) => cat.categoryName),
        datasets: [
          {
            data: this.dashboardData.bestSellingCategories.map((cat: any) => cat.totalQuantity),
            backgroundColor: ['#85461F', '#D8A850', '#B16628', '#F8BC3B', '#38312F'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } },
      },
    });
  }

  initializeCharts(): void {
    this.updateCharts();
  }

  getWeekDays(): string[] {
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) { // Sắp xếp từ ngày đầu tuần đến hiện tại
      const day = new Date(now.getTime());
      day.setDate(now.getDate() - i);
      days.push(`${day.getDate()}/${day.getMonth() + 1}`);
    }
    return days;
  }
}