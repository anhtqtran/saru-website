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
  PaymentMethodID: number;
  PaymentStatusID: number; 
  items: { ProductID: string; ProductName: string; Quantity: number; Price?: number }[];
  VoucherID?: string; 
  TotalOrderAmount?: number; 
}

interface Customer {
  _id: string;
  CustomerName: string;
  CustomerID:string;
}

interface OrderStatus {
  OrderStatusID: number;
  Status: string;
}

interface PaymentMethod {
  _id: string; // ObjectID từ MongoDB
  PaymentMethodID: number; // ID số của phương thức thanh toán
  PaymentMethod: string; // Tên phương thức thanh toán
}

interface PaymentStatus {
  _id: string; // ObjectID từ MongoDB
  PaymentStatusID: number; // ID số của trạng thái thanh toán
  PaymentStatus: string; // Tên trạng thái thanh toán
}

interface Product {
  id: string; // Sử dụng "id" thay vì "_id"
  ProductName: string; // Sử dụng "ProductName" thay vì "name"
  ProductPrice: string; // Sử dụng "ProductPrice" và giữ kiểu string từ backend
  // Các thuộc tính khác nếu cần
  CategoryID?: string;
  PromotionID?: string;
  ImageID?: string;
  ProductBrand?: string;
  ProductContent?: string;
  ProductFullDescription?: string;
  ProductShortDescription?: string;
  WineVolume?: string;
  WineType?: string;
  WineIngredient?: string;
  WineFlavor?: string;
}
interface Voucher {
  _id: string;
  VoucherID: string;
  VoucherExpiredDate: string;
  VoucherStartDate: string;
  VoucherQuantity: number;
  VoucherValue: number;
  VoucherConditionID: number;
}

interface VoucherCondition {
  _id: string;
  VoucherConditionID: number;
  VoucherCondition: string;
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
    PaymentMethodID: 0,
    PaymentStatusID: 0,
    items: [],
    VoucherID: '',
  };
  customers: Customer[] = [];
  orderStatuses: OrderStatus[] = [];
  paymentMethods: PaymentMethod[] = [];
  paymentStatuses: PaymentStatus[] = [];
  products: Product[] = [];
  vouchers: Voucher[] = [];
  voucherConditions: VoucherCondition[] = [];
  isSubmitting: boolean = false;
  isCancelPopupVisible: boolean = false;
  errMessage: string = '';
  successMessage: string = '';
  suggestions: { [key: number]: Product[] } = {};
  isLoading: boolean = true;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadData();
    this.addProduct();
  }

  loadData() {
    this.http.get<Customer[]>('http://localhost:4002/customers').subscribe({
      next: (data) => (this.customers = data),
      error: (err) => (this.errMessage = 'Lỗi khi tải danh sách khách hàng: ' + err.message),
    });

    this.http.get<OrderStatus[]>('http://localhost:4002/order-status').subscribe({
      next: (data) => (this.orderStatuses = data),
      error: (err) => (this.errMessage = 'Lỗi khi tải trạng thái đơn hàng: ' + err.message),
    });

    this.http.get<PaymentMethod[]>('http://localhost:4002/payment-methods').subscribe({
      next: (data) => (this.paymentMethods = data),
      error: (err) => (this.errMessage = 'Lỗi khi tải phương thức thanh toán: ' + err.message),
    });

    this.http.get<PaymentStatus[]>('http://localhost:4002/payment-status').subscribe({
      next: (data) => (this.paymentStatuses = data),
      error: (err) => (this.errMessage = 'Lỗi khi tải trạng thái thanh toán: ' + err.message),
    });

    this.http.get<Product[]>('http://localhost:4002/products').subscribe({
      next: (data) => {
        this.products = data;
        console.log('Danh sách sản phẩm:', this.products);
      },
      error: (err) => (this.errMessage = 'Lỗi khi tải danh sách sản phẩm: ' + err.message),
    });

    this.http.get<VoucherCondition[]>('http://localhost:4002/voucher-conditions').subscribe({
      next: (conditions) => {
        this.voucherConditions = conditions;
        const activeConditionId = conditions.find(c => c.VoucherCondition === 'Đang diễn ra')?.VoucherConditionID;
        if (activeConditionId !== undefined) {
          this.http.get<Voucher[]>('http://localhost:4002/vouchers').subscribe({
            next: (data) => {
              this.vouchers = data.filter(v => v.VoucherConditionID === activeConditionId);
              this.isLoading = false;
            },
            error: (err) => {
              this.errMessage = 'Lỗi khi tải danh sách voucher: ' + err.message;
              this.isLoading = false;
            },
          });
        } else {
          this.errMessage = 'Không tìm thấy điều kiện "Đang diễn ra"';
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.errMessage = 'Lỗi khi tải điều kiện voucher: ' + err.message;
        this.isLoading = false;
      },
    });
  }

  addProduct() {
    this.order.items.push({ ProductID: '', ProductName: '', Quantity: 1, Price: 0 });
    this.suggestions[this.order.items.length - 1] = [];
  }

  removeProduct(index: number) {
    if (this.order.items.length > 1) {
      this.order.items.splice(index, 1);
      delete this.suggestions[index];
      this.updateTotalAmount();
    }
  }

  onProductSearch(index: number, event: Event) {
    const input = (event.target as HTMLInputElement).value.toLowerCase();
    if (input) {
      this.suggestions[index] = this.products.filter(product =>
        product && product.ProductName && product.ProductName.toLowerCase().includes(input)
      );
    } else {
      this.suggestions[index] = [];
    }
  }

  showSuggestions(index: number) {
    if (this.order.items[index].ProductName && this.suggestions[index]?.length === 0) {
      this.suggestions[index] = this.products.filter(product =>
        product && product.ProductName && product.ProductName.toLowerCase().includes(this.order.items[index].ProductName.toLowerCase())
      );
    }
  }

  hideSuggestions(index: number) {
    setTimeout(() => {
      this.suggestions[index] = [];
    }, 200);
  }

  selectProduct(index: number, product: Product) {
    const item = this.order.items[index];
    item.ProductID = product.id; // Sửa từ product.id thành product.ProductID
    item.ProductName = product.ProductName;
    item.Price = product.ProductPrice ? parseFloat(product.ProductPrice) : 0;
    this.suggestions[index] = [];
    this.updateTotalAmount();
  }

  getSubtotal(): number {
    return this.order.items.reduce((sum, item) => {
      return sum + (item.Price || 0) * Number(item.Quantity);
    }, 0);
  }

  getDiscount(): number {
    const subtotal = this.getSubtotal();
    if (!this.order.VoucherID || !this.vouchers.length) {
      return 0;
    }
    const selectedVoucher = this.vouchers.find(v => v.VoucherID === this.order.VoucherID);
    if (!selectedVoucher) {
      return 0;
    }
    const today = new Date();
    const startDate = new Date(selectedVoucher.VoucherStartDate.split('/').reverse().join('-'));
    const expireDate = new Date(selectedVoucher.VoucherExpiredDate.split('/').reverse().join('-'));
    if (today < startDate || today > expireDate || selectedVoucher.VoucherQuantity <= 0) {
      return 0;
    }
    return (subtotal * selectedVoucher.VoucherValue) / 100;
  }

  getTotalAmount(): number {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const totalAfterDiscount = subtotal - discount;
    return totalAfterDiscount < 0 ? 0 : totalAfterDiscount;
  }

  updateTotalAmount() {
    console.log('Total amount updated');
  }

  validateForm(): boolean {
    const errors: string[] = [];

    console.log('Kiểm tra form:', {
      CustomerID: this.order.CustomerID,
      OrderDate: this.order.OrderDate,
      OrderStatusID: this.order.OrderStatusID,
      PaymentMethodID: this.order.PaymentMethodID,
      PaymentStatusID: this.order.PaymentStatusID,
      items: this.order.items,
    });

    if (!this.order.CustomerID || this.order.CustomerID === '') {
      errors.push('Khách hàng không được để trống.');
    }
    if (!this.order.OrderDate) {
      errors.push('Ngày đặt hàng không được để trống.');
    }
    if (this.order.OrderStatusID === 0 || this.order.OrderStatusID === undefined) {
      errors.push('Trạng thái đơn hàng không được để trống.');
    }
    if (this.order.PaymentMethodID === 0 || this.order.PaymentMethodID === undefined) {
      errors.push('Phương thức thanh toán không được để trống.');
    }
    if (this.order.PaymentStatusID === 0 || this.order.PaymentStatusID === undefined) {
      errors.push('Trạng thái thanh toán không được để trống.');
    }
    if (this.order.items.length === 0 || this.order.items.some(item => !item.ProductID || Number(item.Quantity) <= 0)) {
      errors.push('Phải có ít nhất một sản phẩm với số lượng hợp lệ.');
    }

    this.errMessage = errors.join('\n');
    console.log('Lỗi validation:', this.errMessage);
    return errors.length === 0;
  }

  onSubmit() {
    console.log('onSubmit() được gọi');
    if (!this.validateForm()) {
      console.log('Validation thất bại');
      return;
    }

    this.isSubmitting = true;
    const newOrder = {
      CustomerID: this.order.CustomerID,
      OrderID: `order_${Date.now()}`,
      OrderDate: this.order.OrderDate,
      OrderStatusID: Number(this.order.OrderStatusID),
      PaymentMethodID: Number(this.order.PaymentMethodID),
      PaymentStatusID: Number(this.order.PaymentStatusID),
      VoucherID: this.order.VoucherID || null,
      TotalOrderAmount: this.getTotalAmount(),
      items: this.order.items.map(item => ({
        ProductID: item.ProductID,
        Quantity: Number(item.Quantity),
      })),
    };
    console.log('Dữ liệu gửi lên:', newOrder);

    this.http.post('http://localhost:4002/orders', newOrder).subscribe({
      next: (response) => {
        console.log('Phản hồi từ server:', response);
        this.successMessage = 'Tạo đơn hàng thành công!';
        this.errMessage = '';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err) => {
        console.error('Lỗi khi tạo đơn hàng:', err);
        this.errMessage = `Lỗi khi tạo đơn hàng: ${err.status} - ${err.message}`;
        this.successMessage = '';
        this.isSubmitting = false;
      },
    });
  }

  showCancelPopup() {
    this.isCancelPopupVisible = true;
  }

  confirmCancel() {
    this.router.navigate(['/']);
  }

  closeCancelPopup() {
    this.isCancelPopupVisible = false;
  }
}