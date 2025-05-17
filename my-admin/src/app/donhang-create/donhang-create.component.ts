import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderServiceService } from '../services/order-service.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Order {
  OrderID: string;
  CustomerID: string;
  OrderDate: string;
  OrderStatusID: number;
  PaymentMethodID: number;
  PaymentStatusID: number;
  items: { ProductID: string; ProductName: string; Quantity: number; Price: number }[];
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
  ProductID: string;
  ProductName: string;
  ProductPrice: number;
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
    OrderID: '',
    CustomerID: '',
    OrderDate: new Date().toISOString().split('T')[0],
    OrderStatusID: 1,
    PaymentMethodID: 1,
    PaymentStatusID: 1,
    items: [],
    VoucherID: '',
    TotalOrderAmount: 0
  };

  customers: Customer[] = [];
  products: Product[] = [];
  paymentMethods = [
    { PaymentMethodID: 1, PaymentMethod: 'Tiền mặt' },
    { PaymentMethodID: 2, PaymentMethod: 'Chuyển khoản ngân hàng' }
  ];
  suggestions: { [key: number]: Product[] } = {};
  isPopupVisible = false;
  popupMessage = '';
  errMessage = '';
  successMessage = '';

  constructor(
    private orderService: OrderServiceService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadCustomers();
    this.loadProducts();
    this.addProduct(); // Thêm một sản phẩm mặc định khi khởi tạo
  }

  loadCustomers() {
    this.http.get<Customer[]>('http://localhost:4000/customers').subscribe({
      next: (data) => (this.customers = data),
      error: (err) => (this.errMessage = 'Lỗi khi tải danh sách khách hàng: ' + err.message),
    });
  }

  loadProducts() {
    this.http.get<Product[]>('http://localhost:4000/api/products').subscribe({
      next: (data) => {
        this.products = data.map(product => ({
          id: product.id || '',
          ProductID: product.ProductID || '',
          ProductName: product.ProductName || '',
          ProductPrice: Number(product.ProductPrice) || 0
        }));
      },
      error: (err) => (this.errMessage = 'Lỗi khi tải danh sách sản phẩm: ' + err.message),
    });
  }

  addProduct() {
    this.order.items.push({ ProductID: '', ProductName: '', Quantity: 1, Price: 0 });
    this.suggestions[this.order.items.length - 1] = [];
  }

  removeProduct(index: number) {
    this.showPopup('Bạn có chắc muốn xóa sản phẩm này?', () => {
      this.order.items.splice(index, 1);
      delete this.suggestions[index];
      this.updateTotalAmount();
    });
  }

  onProductSearch(index: number, event: Event) {
    const input = (event.target as HTMLInputElement).value.toLowerCase();
    if (input) {
      this.suggestions[index] = this.products.filter(product =>
        product.ProductName.toLowerCase().includes(input)
      );
    } else {
      this.suggestions[index] = [];
    }
  }

  showSuggestions(index: number) {
    if (this.order.items[index].ProductName && this.suggestions[index]?.length === 0) {
      this.suggestions[index] = this.products.filter(product =>
        product.ProductName.toLowerCase().includes(this.order.items[index].ProductName.toLowerCase())
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
    item.ProductID = product.ProductID;
    item.ProductName = product.ProductName;
    item.Price = product.ProductPrice || 0;
    this.suggestions[index] = [];
    this.updateTotalAmount();
  }

  updateTotalAmount() {
    this.order.TotalOrderAmount = this.order.items.reduce((sum, item) => {
      return sum + (item.Price || 0) * (item.Quantity || 0);
    }, 0);
  }

  submitOrder() {
    this.showPopup('Bạn có chắc muốn tạo đơn hàng này?', () => {
      if (!this.order.OrderID || !this.order.CustomerID || this.order.items.length === 0) {
        this.errMessage = 'Vui lòng điền đầy đủ thông tin và ít nhất một sản phẩm!';
        return;
      }

      this.orderService.addOrder(this.order).subscribe({
        next: (response) => {
          this.successMessage = 'Tạo đơn hàng thành công!';
          this.errMessage = '';
          setTimeout(() => this.router.navigate(['/donhang-list']), 2000);
        },
        error: (err) => {
          this.errMessage = `Lỗi khi tạo đơn hàng: ${err.message}`;
          this.successMessage = '';
        }
      });
    });
  }

  resetForm() {
    this.showPopup('Bạn có chắc muốn reset form?', () => {
      this.order = {
        OrderID: '',
        CustomerID: '',
        OrderDate: new Date().toISOString().split('T')[0],
        OrderStatusID: 1,
        PaymentMethodID: 1,
        PaymentStatusID: 1,
        items: [],
        VoucherID: '',
        TotalOrderAmount: 0
      };
      this.suggestions = {};
      this.addProduct();
      this.isPopupVisible = false;
    });
  }

  goBack() {
    this.router.navigate(['/donhang-list']);
  }

  private showPopup(message: string, onConfirm: () => void) {
    this.popupMessage = message;
    this.isPopupVisible = true;
    this.confirmPopup = onConfirm;
    this.cancelPopup = () => (this.isPopupVisible = false);
  }

  confirmPopup: () => void = () => {};
  cancelPopup: () => void = () => {};
}