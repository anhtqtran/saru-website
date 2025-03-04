import { Component } from '@angular/core';

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
    console.log('Customer Info:', this.customer);
    console.log('Products:', this.products);
    console.log('Payment Method:', this.paymentMethod);
    console.log('Total Price:', this.totalPrice);
    alert('Đơn hàng đã được xác nhận!');
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
