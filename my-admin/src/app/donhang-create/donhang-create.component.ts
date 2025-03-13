import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../order-service.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Order {
  CustomerID: string;
  OrderDate: string;
  OrderStatusID: number;
  PaymentMethodID: string;
  PaymentStatusID: string;
  items: { ProductID: string; Quantity: number; Price?: number }[];
}

interface Customer {
  _id: string;
  CustomerName: string;
}

interface OrderStatus {
  OrderStatusID: number;
  Status: string;
}

interface PaymentMethod {
  _id: string;
  Method: string;
}

interface PaymentStatus {
  _id: string;
  Status: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
}

@Component({
  selector: 'app-donhang-create',
  templateUrl: './donhang-create.component.html',
  styleUrls: ['./donhang-create.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DonhangCreateComponent implements OnInit {
  order: Order = {
    CustomerID: '',
    OrderDate: '',
    OrderStatusID: 0,
    PaymentMethodID: '',
    PaymentStatusID: '',
    items: [],
  };
  customers: Customer[] = [];
  orderStatuses: OrderStatus[] = [];
  paymentMethods: PaymentMethod[] = [];
  paymentStatuses: PaymentStatus[] = [];
  products: Product[] = [];
  isSubmitting: boolean = false;
  isCancelPopupVisible: boolean = false;
  errMessage: string = '';
  successMessage: string = '';

  constructor(
    private orderService: OrderService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadData();
    this.addProduct(); // Thêm một sản phẩm mặc định
  }

  loadData() {
    // Lấy danh sách khách hàng
    this.http.get<Customer[]>('http://localhost:4002/customers').subscribe({
      next: (data) => (this.customers = data),
      error: (err) => (this.errMessage = 'Lỗi khi tải danh sách khách hàng: ' + err.message),
    });

    // Lấy danh sách trạng thái đơn hàng
    this.http.get<OrderStatus[]>('http://localhost:4002/order-status').subscribe({
      next: (data) => (this.orderStatuses = data),
      error: (err) => (this.errMessage = 'Lỗi khi tải trạng thái đơn hàng: ' + err.message),
    });

    // Lấy danh sách phương thức thanh toán
    this.http.get<PaymentMethod[]>('http://localhost:4002/payment-methods').subscribe({
      next: (data) => (this.paymentMethods = data),
      error: (err) => (this.errMessage = 'Lỗi khi tải phương thức thanh toán: ' + err.message),
    });

    // Lấy danh sách trạng thái thanh toán
    this.http.get<PaymentStatus[]>('http://localhost:4002/payment-status').subscribe({
      next: (data) => (this.paymentStatuses = data),
      error: (err) => (this.errMessage = 'Lỗi khi tải trạng thái thanh toán: ' + err.message),
    });

    // Lấy danh sách sản phẩm
    this.http.get<Product[]>('http://localhost:4002/products').subscribe({
      next: (data) => (this.products = data),
      error: (err) => (this.errMessage = 'Lỗi khi tải danh sách sản phẩm: ' + err.message),
    });
  }

  addProduct() {
    this.order.items.push({ ProductID: '', Quantity: 1 });
  }

  removeProduct(index: number) {
    if (this.order.items.length > 1) {
      this.order.items.splice(index, 1);
    }
  }

  updateProductPrice(index: number) {
    const item = this.order.items[index];
    const product = this.products.find(p => p._id === item.ProductID);
    if (product) {
      item.Price = product.price;
    }
  }

  getTotalAmount(): number {
    return this.order.items.reduce((sum, item) => {
      const product = this.products.find(p => p._id === item.ProductID);
      return sum + (product ? product.price * item.Quantity : 0);
    }, 0);
  }

  validateForm(): boolean {
    const errors: string[] = [];

    if (!this.order.CustomerID) errors.push('Khách hàng không được để trống.');
    if (!this.order.OrderDate) errors.push('Ngày đặt hàng không được để trống.');
    if (!this.order.OrderStatusID) errors.push('Trạng thái đơn hàng không được để trống.');
    if (!this.order.PaymentMethodID) errors.push('Phương thức thanh toán không được để trống.');
    if (!this.order.PaymentStatusID) errors.push('Trạng thái thanh toán không được để trống.');
    if (this.order.items.length === 0 || this.order.items.some(item => !item.ProductID || item.Quantity <= 0)) {
      errors.push('Phải có ít nhất một sản phẩm với số lượng hợp lệ.');
    }

    this.errMessage = errors.join('\n');
    return errors.length === 0;
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    const newOrder = {
      CustomerID: this.order.CustomerID,
      OrderDate: this.order.OrderDate,
      OrderStatusID: this.order.OrderStatusID,
      PaymentMethodID: this.order.PaymentMethodID,
      PaymentStatusID: this.order.PaymentStatusID,
      products: this.order.items.map(item => ({
        ProductId: item.ProductID,
        Quantity: item.Quantity,
      })),
    };

    this.orderService.addOrder(newOrder).subscribe({
      next: (response) => {
        this.successMessage = 'Tạo đơn hàng thành công!';
        this.errMessage = '';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err) => {
        this.errMessage = 'Lỗi khi tạo đơn hàng: ' + err.message;
        this.successMessage = '';
        this.isSubmitting = false;
      },
    });
  }

  showCancelPopup() {
    this.isCancelPopupVisible = true;
  }

  closeCancelPopup() {
    this.isCancelPopupVisible = false;
  }

  confirmCancel() {
    this.isCancelPopupVisible = false;
    this.router.navigate(['/']);
  }
}