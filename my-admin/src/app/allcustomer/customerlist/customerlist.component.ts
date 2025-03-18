import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Customer } from '../../classes/customer';
import { CustomerService } from '../../services/customer.service';
import { OrderService } from '../../services/order.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';

interface CustomerAddress {
  address: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}

@Component({
  selector: 'app-customerlist',
  standalone: false,
  templateUrl: './customerlist.component.html',
  styleUrl: './customerlist.component.css',
  animations: [
    trigger('filterAnimation', [
      state('void', style({
        opacity: 0,
        maxHeight: '0px',
        transform: 'translateY(-10px)'
      })),
      state('*', style({
        opacity: 1,
        maxHeight: '500px',
        transform: 'translateY(0)'
      })),
      transition('void => *', [
        animate('300ms ease-out')
      ]),
      transition('* => void', [
        animate('300ms ease-in')
      ])
    ])
  ]
})
export class CustomerlistComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'CustomerID', 'CustomerName', 'CustomerPhone', 'CustomerBirth', 'action'];
  dataSource: MatTableDataSource<Customer>;
  filterForm: FormGroup;
  showFilter = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  customerService = inject(CustomerService);
  orderService = inject(OrderService);
  fb = inject(FormBuilder);

  private allCustomers: Customer[] = [];

  constructor() {
    this.dataSource = new MatTableDataSource([] as any);
    this.filterForm = this.fb.group({
      customerName: [''],
      city: [''],
      birthFrom: [null],
      birthTo: [null],
      receiveEmail: ['']
    });
  }

  ngOnInit() {
    this.getServerData();
  }

  private getServerData() {
    this.customerService.getAllCustomer().subscribe((result) => {
      console.log("Dữ liệu từ API:", result);
      result.forEach(customer => {
        if (customer.CustomerBirth) {
          customer.CustomerBirth = new Date(customer.CustomerBirth).toISOString().split('T')[0];
        }
      });
      this.allCustomers = result;
      this.dataSource.data = result;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyAdvancedFilter() {
    const filters = this.filterForm.value;
    let filteredData = [...this.allCustomers];

    if (filters.customerName) {
      filteredData = filteredData.filter(customer =>
        customer.CustomerName.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }

    if (filters.city) {
      filteredData = filteredData.filter(customer => {
        let customerAdd: CustomerAddress | null = null;
        try {
          customerAdd = JSON.parse(customer.CustomerAdd) as CustomerAddress;
        } catch (e) {
          console.error('Lỗi parse CustomerAdd:', e);
        }
        return customerAdd && customerAdd.city?.toLowerCase().includes(filters.city.toLowerCase());
      });
    }

    if (filters.birthFrom) {
      const fromDate = new Date(filters.birthFrom);
      filteredData = filteredData.filter(customer =>
        new Date(customer.CustomerBirth) >= fromDate
      );
    }

    if (filters.birthTo) {
      const toDate = new Date(filters.birthTo);
      filteredData = filteredData.filter(customer =>
        new Date(customer.CustomerBirth) <= toDate
      );
    }

    if (filters.receiveEmail !== '') {
      const receiveEmail = filters.receiveEmail === 'true';
      filteredData = filteredData.filter(customer =>
        customer.ReceiveEmail === receiveEmail
      );
    }

    this.dataSource.data = filteredData;
  }

  resetFilter() {
    this.filterForm.reset();
    this.dataSource.data = this.allCustomers;
    this.showFilter = false;
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  private checkOrderHistory(customerId: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.orderService.getOrdersByCustomerID(customerId).subscribe(
        (orders) => resolve(orders && orders.length > 0),
        (error) => {
          console.error('Lỗi khi kiểm tra lịch sử đơn hàng:', error);
          resolve(false);
        }
      );
    });
  }

  async delete(id: string) {
    const customer = this.dataSource.data.find(c => c._id === id);
    if (!customer) {
      alert('Không tìm thấy khách hàng!');
      return;
    }

    const hasOrders = await this.checkOrderHistory(customer.CustomerID);
    if (hasOrders) {
      alert('Không thể xóa khách hàng này vì đã có lịch sử đơn hàng!');
      return;
    }

    this.customerService.deleteCustomerById(id).subscribe(
      (result: any) => {
        alert('Xóa khách hàng thành công');
        this.getServerData();
      },
      (error) => {
        alert('Có lỗi xảy ra khi xóa khách hàng');
        console.error('Lỗi xóa khách hàng:', error);
      }
    );
  }
  toggleAdminMenu(): void {
    console.log('Admin menu toggled');
  }
}