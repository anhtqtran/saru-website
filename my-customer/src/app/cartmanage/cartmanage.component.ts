import { Component } from '@angular/core';

@Component({
  selector: 'app-cartmanage',
  standalone: false,
  templateUrl: './cartmanage.component.html',
  styleUrl: './cartmanage.component.css'
})
export class CartmanageComponent {
  cartItems = [
    {
      id: 1,
      name: 'Rượu mơ má đào Mộc Châu',
      price: 279000,
      quantity: 1,
      image: 'product-placeholder.png'
    }
  ];

  showPopup: boolean = false; // Kiểm soát trạng thái hiển thị popup

  increaseQuantity(index: number) {
    this.cartItems[index].quantity++;
  }

  decreaseQuantity(index: number) {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity--;
    }
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  placeOrder() {
    this.showPopup = true; // Mở popup khi đặt hàng thành công
  }

  closePopup() {
    this.showPopup = false; // Đóng popup khi nhấn "Trở lại"
  }
}
