import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isSearchOpen = false;
  cartCount = 0;
  compareCount = 0;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.updateCartAndCompareCount();
  }

  toggleSearchBar(searchBox: HTMLInputElement) {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => searchBox.focus(), 0); // Focus vào input khi mở
    }
  }

  toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks?.classList.toggle('hidden');
  }

  updateCartAndCompareCount() {
    this.productService.getCartItems().subscribe({
      next: (data) => this.cartCount = data.cart.length,
      error: (err) => console.error('Error fetching cart:', err)
    });
    this.productService.getCompareItems().subscribe({
      next: (data) => this.compareCount = data.compare.length,
      error: (err) => console.error('Error fetching compare:', err)
    });
  }
}