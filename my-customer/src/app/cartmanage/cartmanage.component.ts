import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router'
@Component({
  selector: 'app-cartmanage',
  standalone: false,
  templateUrl: './cartmanage.component.html',
  styleUrls: ['./cartmanage.component.css'],
  providers: [DecimalPipe],
})
export class CartmanageComponent implements OnInit {
  cartItems: any[] = [];
  showPopup: boolean = false;

  constructor(private cartService: CartService, private decimalPipe: DecimalPipe, private router: Router) {}

  ngOnInit() {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items.map(item => ({
        ...item,
        price: this.convertToNumber(item.price) // Chuyển đổi giá về số
      }));
      console.log(" Dữ liệu giỏ hàng cập nhật:", this.cartItems);
    });
    
    
  }
  convertToNumber(value: any): number {
    if (typeof value === 'number') return value; // Nếu là số thì giữ nguyên
    if (typeof value === 'string') {
      return Number(value.replace(/[^\d]/g, '')); // Loại bỏ ký tự không phải số
    }
    return 0;
  }
  increaseQuantity(index: number) {
    this.cartItems[index].quantity++;
    this.cartService.updateCart(this.cartItems);
  }
  
  decreaseQuantity(index: number) {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity--;
      this.cartService.updateCart(this.cartItems);
    }
  }
  

  removeItem(index: number) {
    this.cartService.removeFromCart(index);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  

  // placeOrder() {
  //   this.showPopup = true;
  // }

  placeOrder() {
    this.router.navigate(['/paymentdetail']); // Chuyển hướng sang trang điền thông tin nhận hàng
  }

  closePopup() {
    this.showPopup = false;
  }

 
}