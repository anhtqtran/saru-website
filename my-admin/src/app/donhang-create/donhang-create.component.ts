import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderServiceService } from '../services/order-service.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Order {
  CustomerID: string;
  OrderDate: string;
  OrderStatusID: number;
  PaymentMethodID: number;
  PaymentStatusID: number;
  items: { ProductID: string; ProductName: string; Quantity: number; Price?: number }[];
  VoucherID?: string;
  TotalOrderAmount?: number;
}

interface Customer {
  _id: string;
  CustomerName: string;
  CustomerID: string;
}

interface Product {
  id: string;
  ProductName: string;
  ProductPrice: string;
}

@Component({
  selector: 'app-donhang-create',
  templateUrl: './donhang-create.component.html',
  styleUrls: ['./donhang-create.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DonhangCreateComponent implements OnInit {
  // Định nghĩa customer cho thông tin khách hàng
  customer = {
    name: '',
    phone: '',
    email: '',
    address: '',
    city: ''
  };

  // Định nghĩa products thay vì items để khớp với HTML
  products: { name: string; quantity: number; price: number; total?: number }[] = [
    { name: '', quantity: 1, price: 0 }
  ];

  order: Order = {
    CustomerID: '',
    OrderDate: new Date().toISOString().split('T')[0], // Mặc định ngày hiện tại
    OrderStatusID: 1, // Chờ xác nhận
    PaymentMethodID: 0,
    PaymentStatusID: 1, // Chưa thanh toán
    items: [],
    VoucherID: ''
  };

  customers: Customer[] = [];
  paymentMethods = [
    { PaymentMethodID: 1, PaymentMethod: 'Tiền mặt' },
    { PaymentMethodID: 2, PaymentMethod: 'Chuyển khoản ngân hàng' }
  ];
  isPopupVisible = false;
  popupMessage = '';
  errMessage = '';
  successMessage = '';

  newOrder: any = {
    OrderID: '',
    CustomerID: '',
    OrderDate: new Date().toISOString().split('T')[0],
    OrderStatusID: 1,
    PaymentStatusID: 1,
    TotalOrderAmount: 0,
    items: []
  };

  constructor(
    private orderService: OrderServiceService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.http.get<Customer[]>('http://localhost:4002/customers').subscribe({
      next: (data) => (this.customers = data),
      error: (err) => (this.errMessage = 'Lỗi khi tải danh sách khách hàng: ' + err.message),
    });
  }

  addProduct() {
    this.products.push({ name: '', quantity: 1, price: 0 });
  }

  updateTotalPrice() {
    this.products.forEach(product => {
      product.total = product.quantity * product.price;
    });
  }

  removeProductWithConfirmation(index: number) {
    this.showPopup('Bạn có chắc muốn xóa sản phẩm này?', () => {
      this.products.splice(index, 1);
      this.updateTotalPrice();
    });
  }

  submitOrderWithConfirmation() {
    this.showPopup('Bạn có chắc muốn lưu đơn hàng này?', () => {
      // Map products sang items để gửi lên server
      this.order.items = this.products.map(p => ({
        ProductID: '', // Cần logic để lấy ProductID từ danh sách sản phẩm thực tế
        ProductName: p.name,
        Quantity: p.quantity,
        Price: p.price
      }));
      this.order.CustomerID = this.customers.find(c => c.CustomerName === this.customer.name)?.CustomerID || '';
      this.order.TotalOrderAmount = this.getTotalAmount();

      this.http.post('http://localhost:4002/orders', this.order).subscribe({
        next: () => {
          this.successMessage = 'Tạo đơn hàng thành công!';
          this.errMessage = '';
          setTimeout(() => this.router.navigate(['/']), 2000);
        },
        error: (err) => {
          this.errMessage = `Lỗi khi tạo đơn hàng: ${err.message}`;
          this.successMessage = '';
        }
      });
    });
  }

  resetFormWithConfirmation() {
    this.showPopup('Bạn có chắc muốn reset form?', () => {
      this.customer = { name: '', phone: '', email: '', address: '', city: '' };
      this.products = [{ name: '', quantity: 1, price: 0 }];
      this.order = {
        CustomerID: '',
        OrderDate: new Date().toISOString().split('T')[0],
        OrderStatusID: 1,
        PaymentMethodID: 0,
        PaymentStatusID: 1,
        items: [],
        VoucherID: ''
      };
      this.isPopupVisible = false;
    });
  }

  getTotalAmount(): number {
    return this.products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  }

  private showPopup(message: string, onConfirm: () => void) {
    this.popupMessage = message;
    this.isPopupVisible = true;
    this.confirmPopup = () => {
      onConfirm();
      this.isPopupVisible = false;
    };
    this.cancelPopup = () => {
      this.isPopupVisible = false;
    };
  }
  createOrder() {
    // Tính tổng tiền dựa trên items
    this.newOrder.TotalOrderAmount = this.newOrder.items.reduce((sum: number, item: any) => {
      return sum + (item.Price || 0) * (item.Quantity || 0);
    }, 0);

    this.orderService.addOrder(this.newOrder).subscribe({
      next: (response) => {
        console.log('Tạo đơn hàng thành công:', response);
        this.router.navigate(['/donhang-list']);
      },
      error: (err) => {
        this.errMessage = `Lỗi khi tạo đơn hàng: ${err.message}`;
        console.error('Lỗi createOrder:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/donhang-list']);
  }

  confirmPopup: () => void = () => {};
  cancelPopup: () => void = () => {};
}