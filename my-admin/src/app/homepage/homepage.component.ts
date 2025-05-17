import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { Chart } from 'chart.js';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class HomepageComponent implements OnInit, AfterViewInit {
  dashboardData: any = {
    listingCount: 0,
    pendingOrders: 0,
    messagesCount: 0,
    totalSales: 0,
    salesChange: '',
    totalIncome: 0,
    incomeChange: '',
    conversionRate: '0',
    rateChange: '0',
  };
  salesChart: Chart | undefined;
  categoriesChart: Chart | undefined;
  showSettings: boolean = false;
  currentPeriod: string = 'thisWeek';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe(baseData => {
      this.updateData(this.getPeriodData(this.currentPeriod, baseData));
    }, error => {
      console.error('Error loading dashboard data:', error);
    });
  }

  updateTimePeriod(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const period = selectElement.value;
    if (this.currentPeriod !== period) {
      this.currentPeriod = period;
      this.loadDashboardData();
    }
  }

  getPeriodData(period: string, baseData: any): any {
    const data = { ...baseData };
    switch (period) {
      case 'thisWeek':
        return {
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
            labels: this.getWeekDays(),
            datasets: [
              { label: 'Laptops', data: [1200, 1500, 1800, 1400, 1600, 1700, 1800], borderColor: '#85461F', tension: 0.1, fill: false },
              { label: 'Headsets', data: [800, 1000, 1200, 900, 1100, 1200, 1300], borderColor: '#D8A850', tension: 0.1, fill: false },
              { label: 'Phones', data: [1000, 1300, 1500, 1200, 1400, 1500, 1600], borderColor: '#B16628', tension: 0.1, fill: false },
            ],
          },
          categoriesData: {
            labels: ['Electronics', 'Furniture', 'Toys'],
            data: [50, 30, 20],
          },
        };
      case 'thisMonth':
        return {
          listingCount: 200,
          pendingOrders: 5,
          messagesCount: 10,
          totalSales: 8500,
          salesChange: '+1000',
          totalIncome: 90000000,
          incomeChange: '+10000000',
          conversionRate: '15.2',
          rateChange: '4.0',
          salesData: {
            labels: this.getCurrentMonthWeeks(),
            datasets: [
              { label: 'Laptops', data: [2000, 2500, 3000, 2800], borderColor: '#85461F', tension: 0.1, fill: false },
              { label: 'Headsets', data: [1500, 1800, 2000, 1700], borderColor: '#D8A850', tension: 0.1, fill: false },
              { label: 'Phones', data: [1800, 2200, 2500, 2300], borderColor: '#B16628', tension: 0.1, fill: false },
            ],
          },
          categoriesData: {
            labels: ['Electronics', 'Furniture', 'Toys'],
            data: [60, 25, 15],
          },
        };
      case 'lastMonth':
        return {
          listingCount: 180,
          pendingOrders: 3,
          messagesCount: 8,
          totalSales: 6500,
          salesChange: '+500',
          totalIncome: 70000000,
          incomeChange: '+8000000',
          conversionRate: '10.5',
          rateChange: '2.0',
          salesData: {
            labels: this.getLastMonthWeeks(),
            datasets: [
              { label: 'Laptops', data: [1500, 1800, 2000, 1800], borderColor: '#85461F', tension: 0.1, fill: false },
              { label: 'Headsets', data: [1200, 1400, 1600, 1300], borderColor: '#D8A850', tension: 0.1, fill: false },
              { label: 'Phones', data: [1400, 1700, 1900, 1600], borderColor: '#B16628', tension: 0.1, fill: false },
            ],
          },
          categoriesData: {
            labels: ['Electronics', 'Furniture', 'Toys'],
            data: [55, 30, 15],
          },
        };
      default:
        return data;
    }
  }

  updateData(data: any): void {
    this.dashboardData = {
      ...this.dashboardData,
      listingCount: data.listingCount,
      pendingOrders: data.pendingOrders,
      messagesCount: data.messagesCount,
      totalSales: data.totalSales,
      salesChange: data.salesChange,
      totalIncome: data.totalIncome,
      incomeChange: data.incomeChange,
      conversionRate: data.conversionRate,
      rateChange: data.rateChange,
    };
    this.initializeCharts(data.salesData, data.categoriesData);
  }

  initializeCharts(salesData?: any, categoriesData?: any): void {
    if (this.salesChart) this.salesChart.destroy();
    if (this.categoriesChart) this.categoriesChart.destroy();

    this.salesChart = new Chart('salesChart', {
      type: 'line',
      data: {
        labels: salesData?.labels || this.getWeekDays(),
        datasets: salesData?.datasets || [
          { label: 'Laptops', data: [1200, 1500, 1800, 1400, 1600, 1700, 1800], borderColor: '#85461F', tension: 0.1, fill: false },
          { label: 'Headsets', data: [800, 1000, 1200, 900, 1100, 1200, 1300], borderColor: '#D8A850', tension: 0.1, fill: false },
          { label: 'Phones', data: [1000, 1300, 1500, 1200, 1400, 1500, 1600], borderColor: '#B16628', tension: 0.1, fill: false },
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
        labels: categoriesData?.labels || ['Electronics', 'Furniture', 'Toys'],
        datasets: [{
          data: categoriesData?.data || [50, 30, 20],
          backgroundColor: ['#85461F', '#D8A850', '#B16628'],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } },
      },
    });
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
    console.log('Settings toggled:', this.showSettings);
  }

  toggleAdminMenu(): void {
    console.log('Admin menu toggled');
  }

  // Tính toán ngày động
  public getCurrentWeekRange(): string {
    const now = new Date('2025-02-26');
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
    return `Tuần này (${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}/2025)`;
  }

  public getCurrentMonth(): string {
    const now = new Date('2025-02-26');
    return `Tháng này (${(now.getMonth() + 1).toString().padStart(2, '0')}/2025)`;
  }

  public getLastMonth(): string {
    const now = new Date('2025-02-26');
    const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
    return `Tháng trước (${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}/2025)`;
  }

  private getWeekDays(): string[] {
    const now = new Date('2025-02-26');
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(now.setDate(now.getDate() - now.getDay() + i));
      days.push(`${day.getDate()}/${day.getMonth() + 1}`);
    }
    return days;
  }

  private getCurrentMonthWeeks(): string[] {
    const now = new Date('2025-02-26');
    const weeks = [];
    for (let i = 1; i <= 4; i++) {
      weeks.push(`Tuần ${i}`);
    }
    return weeks;
  }

  private getLastMonthWeeks(): string[] {
    const now = new Date('2025-02-26');
    const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
    const weeks = [];
    for (let i = 1; i <= 4; i++) {
      weeks.push(`Tuần ${i}`);
    }
    return weeks;
  }
}