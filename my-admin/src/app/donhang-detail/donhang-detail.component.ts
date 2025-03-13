import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Order {
  _id: string;
  OrderID: string;
  CustomerID: string;
  CustomerName?: string;
  CustomerAdd?: {
    address: string;
    city: string;
    state: string;
  };
  CustomerPhone?: string;
  OrderDate: string;
  OrderStatusID: number;
  OrderStatusText?: string;
  PaymentStatusID: string;
  PaymentStatusText?: string;
  PaymentMethodID: string;
  PaymentMethodText?: string;
  items: {
    ProductID: string;
    Quantity: number;
    ProductName?: string;
    ProductCategory?: string;
    ProductImageCover?: string;
    Price?: number;
    TotalPrice?: number;
  }[];
  TotalOrderAmount?: number;
}

interface Customer {
  _id: string;
  CustomerID: string;
  CustomerName: string;
  MemberID: string;
  CustomerAdd: {
    address: string;
    city: string;
    state: string;
  };
  CustomerPhone: string;
  CustomerBirth: string;
  CustomerAvatar: string;
  ReceiveEmail: boolean;
}

interface OrderStatus {
  _id: string;
  OrderStatusID: number;
  Status: string;
}

interface PaymentMethod {
  _id: string;
  PaymentMethodID: string;
  PaymentMethod: string;
}

interface PaymentStatus {
  _id: string;
  PaymentStatusID: string;
  PaymentStatus: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
}

@Component({
  selector: 'app-donhang-detail',
  templateUrl: './donhang-detail.component.html',
  styleUrls: ['./donhang-detail.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class DonhangDetailComponent implements OnInit {
  order: Order | null = null;
  customers: Customer[] = [];
  orderStatuses: OrderStatus[] = [];
  paymentMethods: PaymentMethod[] = [];
  paymentStatuses: PaymentStatus[] = [];
  products: Product[] = [];
  editMode: boolean = false;
  isCancelPopupVisible: boolean = false;
  errMessage: string = '';
  successMessage: string = '';
  validationErrors: string[] = [];

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      const orderFromState = history.state.order;
      if (orderFromState) {
        this.order = { ...orderFromState };
      } else {
        this.loadOrderDetail(orderId);
      }
      this.loadData();
    } else {
      this.errMessage = 'Không tìm thấy ID đơn hàng.';
    }
    this.isCancelPopupVisible = false;
  }

  loadOrderDetail(orderId: string): void {
    this.orderService.getOrderById(orderId).subscribe({
      next: (data) => {
        this.order = {
          _id: data._id,
          OrderID: data.OrderID,
          CustomerID: data.CustomerID,
          CustomerName: data.CustomerName || 'Không xác định',
          CustomerAdd: data.CustomerAdd || { address: '', city: '', state: '' },
          CustomerPhone: data.CustomerPhone || '',
          OrderDate: new Date(data.OrderDate).toISOString().split('T')[0],
          OrderStatusID: parseInt(data.OrderStatusID, 10) || 0,
          OrderStatusText: data.Status || 'Không xác định',
          PaymentStatusID: data.PaymentStatusID || '',
          PaymentStatusText: data.PaymentStatus || 'Không xác định',
          PaymentMethodID: data.PaymentMethodID || '',
          PaymentMethodText: data.PaymentMethod || 'Không xác định',
          items: data.items.map((item: any) => ({
            ProductID: item.ProductID || '',
            Quantity: item.Quantity || 0,
            ProductName: item.ProductName || 'Không xác định',
            ProductCategory: item.ProductCategory || 'Không xác định',
            ProductImageCover: item.ProductImageCover || '',
            Price: item.Price || 0,
            TotalPrice: item.TotalPrice || 0,
          })),
          TotalOrderAmount: data.TotalOrderAmount || 0,
        };
        console.log('Chi tiết đơn hàng:', this.order);
      },
      error: (err) => {
        this.errMessage = `Lỗi khi tải chi tiết đơn hàng: ${err.message}`;
        console.error('Lỗi:', err);
      },
    });
  }

  loadData(): void {
    this.http.get<Customer[]>('http://localhost:4002/customers').subscribe({
      next: (data) => {
        this.customers = data;
        if (this.order) {
          this.updateCustomerInfo();
        }
      },
      error: (err) => (this.errMessage = `Lỗi khi tải danh sách khách hàng: ${err.message}`),
    });

    this.http.get<OrderStatus[]>('http://localhost:4002/order-status').subscribe({
      next: (data) => (this.orderStatuses = data),
      error: (err) => (this.errMessage = `Lỗi khi tải trạng thái đơn hàng: ${err.message}`),
    });

    this.http.get<PaymentMethod[]>('http://localhost:4002/payment-methods').subscribe({
      next: (data) => (this.paymentMethods = data),
      error: (err) => (this.errMessage = `Lỗi khi tải phương thức thanh toán: ${err.message}`),
    });

    this.http.get<PaymentStatus[]>('http://localhost:4002/payment-status').subscribe({
      next: (data) => (this.paymentStatuses = data),
      error: (err) => (this.errMessage = `Lỗi khi tải trạng thái thanh toán: ${err.message}`),
    });

    this.http.get<Product[]>('http://localhost:4002/products').subscribe({
      next: (data) => (this.products = data),
      error: (err) => (this.errMessage = `Lỗi khi tải danh sách sản phẩm: ${err.message}`),
    });
  }

  enableEditMode(): void {
    this.editMode = true;
    this.errMessage = '';
    this.successMessage = '';
    this.validationErrors = [];
  }

  addProduct(): void {
    if (!this.order) return;
    this.order.items.push({
      ProductID: '',
      Quantity: 1,
      ProductName: '',
      ProductCategory: '',
      ProductImageCover: '',
      Price: 0,
      TotalPrice: 0,
    });
  }

  removeProduct(index: number): void {
    if (!this.order || this.order.items.length <= 1) return;
    this.order.items.splice(index, 1);
  }

  updateProductPrice(index: number): void {
    if (!this.order) return;
    const item = this.order.items[index];
    const product = this.products.find(p => p._id === item.ProductID);
    if (product) {
      item.Price = product.price;
      item.TotalPrice = product.price * item.Quantity;
      // Cập nhật ProductName và ProductCategory (nếu cần)
      item.ProductName = product.name || 'Không xác định';
      // Giả định ProductCategory từ dữ liệu, cần điều chỉnh nếu có collection riêng
      item.ProductCategory = 'Không xác định'; // Thay bằng logic thực tế nếu có
    }
  }

  getTotalAmount(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((sum, item) => sum + (item.TotalPrice || 0), 0);
  }

  validateForm(): boolean {
    this.validationErrors = [];

    if (!this.order) return false;

    if (!this.order.CustomerID) this.validationErrors.push('Khách hàng không được để trống.');
    if (!this.order.OrderDate) this.validationErrors.push('Ngày đặt hàng không được để trống.');
    if (!this.order.OrderStatusID && this.order.OrderStatusID !== 0) this.validationErrors.push('Trạng thái đơn hàng không được để trống.');
    if (!this.order.PaymentMethodID) this.validationErrors.push('Phương thức thanh toán không được để trống.');
    if (!this.order.PaymentStatusID) this.validationErrors.push('Trạng thái thanh toán không được để trống.');
    if (this.order.items.length === 0 || this.order.items.some(item => !item.ProductID || item.Quantity <= 0)) {
      this.validationErrors.push('Phải có ít nhất một sản phẩm với số lượng hợp lệ.');
    }

    return this.validationErrors.length === 0;
  }

  updateOrder(): void {
    if (!this.order || !this.validateForm()) {
      this.errMessage = 'Vui lòng sửa các lỗi sau trước khi lưu: ' + this.validationErrors.join(' ');
      return;
    }

    const updatedOrder = {
      CustomerID: this.order.CustomerID,
      OrderDate: this.order.OrderDate,
      OrderStatusID: this.order.OrderStatusID,
      PaymentMethodID: this.order.PaymentMethodID,
      PaymentStatusID: this.order.PaymentStatusID,
      items: this.order.items.map(item => ({
        ProductID: item.ProductID,
        Quantity: item.Quantity,
      })),
    };

    this.http.put(`http://localhost:4002/orders/${this.order._id}`, updatedOrder).subscribe({
      next: () => {
        this.successMessage = 'Cập nhật đơn hàng thành công!';
        this.errMessage = '';
        this.editMode = false;
        this.loadOrderDetail(this.order!._id);
      },
      error: (err) => {
        this.errMessage = `Lỗi khi cập nhật đơn hàng: ${err.message}`;
        this.successMessage = '';
      },
    });
  }

  cancel(): void {
    if (this.editMode) {
      this.showCancelPopup();
    } else {
      this.router.navigate(['/donhang-list']);
    }
  }

  cancelEdit(): void {
    this.showCancelPopup();
  }

  showCancelPopup(): void {
    this.isCancelPopupVisible = true;
  }

  closeCancelPopup(): void {
    this.isCancelPopupVisible = false;
  }

  confirmCancel(): void {
    this.isCancelPopupVisible = false;
    if (this.editMode) {
      this.editMode = false;
      if (this.order) {
        this.loadOrderDetail(this.order._id);
      }
    } else {
      this.router.navigate(['/donhang-list']);
    }
    this.errMessage = '';
    this.successMessage = '';
    this.validationErrors = [];
  }

  updateCustomerInfo(): void {
    if (!this.order || !this.customers.length) return;

    const selectedCustomer = this.customers.find(c => c.CustomerID === this.order!.CustomerID);
    if (selectedCustomer) {
      this.order.CustomerName = selectedCustomer.CustomerName;
      this.order.CustomerAdd = selectedCustomer.CustomerAdd;
      this.order.CustomerPhone = selectedCustomer.CustomerPhone;
    } else {
      this.order.CustomerName = 'Không xác định';
      this.order.CustomerAdd = { address: '', city: '', state: '' };
      this.order.CustomerPhone = '';
    }
  }
}