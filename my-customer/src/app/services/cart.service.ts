import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: any[] = [];
  private cartItemsSubject = new BehaviorSubject<any[]>([]);

  constructor() {
    this.loadCartFromStorage(); // Load giỏ hàng từ localStorage khi khởi động
  }

  private loadCartFromStorage() {
    const savedCart = localStorage.getItem('cartItems');
    this.cartItems = savedCart ? JSON.parse(savedCart) : [];
    this.cartItemsSubject.next(this.cartItems);
  }

  private saveCartToStorage() {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  getCartItems() {
    return this.cartItemsSubject.asObservable();
  }

  getCart() {
    return this.cartItems;
  }

  addToCart(product: any) {
    const existingProduct = this.cartItems.find(item => item.id === product.id);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      this.cartItems.push({ ...product, quantity: 1 });
    }
    this.saveCartToStorage();
    this.cartItemsSubject.next([...this.cartItems]); // 🔥 Phát tín hiệu cập nhật
    console.log(" Giỏ hàng cập nhật:", this.cartItems);
  }

  removeFromCart(index: number) {
    this.cartItems.splice(index, 1);
    this.saveCartToStorage();
    this.cartItemsSubject.next([...this.cartItems]);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  updateCart(cartItems: any[]) {
    this.cartItems = [...cartItems]; // Cập nhật giỏ hàng
    this.cartItemsSubject.next(this.cartItems); // Phát tín hiệu cập nhật
    console.log("🔄 Giỏ hàng đã cập nhật:", this.cartItems);
  }
  
}