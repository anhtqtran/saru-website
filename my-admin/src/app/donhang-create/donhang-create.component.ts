import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../order-service.service';
@Component({
  selector: 'app-donhang-create',
  standalone: false,
  templateUrl: './donhang-create.component.html',
  styleUrls: ['./donhang-create.component.css']
})
export class DonhangCreateComponent {
  customer = {
    name: '',
    phone: '',
    email: '',
    address: '',
    city: ''
  };

  products = [
    { name: '', quantity: 1, price: 0, total: 0 }
  ];

  paymentMethod: string = 'cash';
  totalPrice: number = 0;

  // Pop-up confirmation state
  isPopupVisible: boolean = false;
  popupMessage: string = '';
  popupAction!: () => void;

  constructor(private orderService: OrderService, private router: Router) {}

  addProduct() {
    this.products.push({ name: '', quantity: 1, price: 0, total: 0 });
  }

  removeProduct(index: number) {
    this.products.splice(index, 1);
    this.updateTotalPrice();
  }

  updateTotalPrice() {
    this.totalPrice = 0;
    this.products.forEach(product => {
      product.total = product.quantity * product.price;
      this.totalPrice += product.total;
    });
  }

  submitOrder() {
    const orderData = {
      customer: this.customer,
      products: this.products,
      paymentMethod: this.paymentMethod,
      totalPrice: this.totalPrice
    };

    console.log('Customer Info:', this.customer);
    console.log('Products:', this.products);
    console.log('Payment Method:', this.paymentMethod);
    console.log('Total Price:', this.totalPrice);

    this.orderService.addOrder(orderData).subscribe(
      response => {
        alert('Đơn hàng đã được tạo thành công!');
        this.router.navigate(['/donhang-list']); // Chuyển về trang danh sách đơn hàng
      },
      error => {
        alert('Có lỗi xảy ra khi tạo đơn hàng!');
        console.error(error);
      }
    );
  }

  resetForm() {
    this.customer = { name: '', phone: '', email: '', address: '', city: '' };
    this.products = [{ name: '', quantity: 1, price: 0, total: 0 }];
    this.paymentMethod = 'cash';
    this.totalPrice = 0;
  }

  // Show confirmation pop-up
  showPopup(message: string, action: () => void) {
    this.popupMessage = message;
    this.popupAction = action;
    this.isPopupVisible = true;
  }
  
  confirmPopup() {
    if (this.popupAction) {
      this.popupAction();
    }
    this.isPopupVisible = false;
  }
  
  cancelPopup() {
    this.isPopupVisible = false;
  }

  removeProductWithConfirmation(index: number) {
    this.showPopup(`Bạn có xác nhận xóa sản phẩm này?`, () => {
      this.removeProduct(index);
    });
  }

  submitOrderWithConfirmation() {
    this.showPopup('Bạn có xác nhận đơn hàng này?', () => {
      this.submitOrder();
    });
  }

  resetFormWithConfirmation() {
    this.showPopup('Bạn có xác nhận hủy thay đổi?', () => {
      this.resetForm();
    });
  }
}
