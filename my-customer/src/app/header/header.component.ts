import { Component, OnInit, OnDestroy  } from '@angular/core';
import { ProductService } from '../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isSearchOpen = false;
  cartItemCount: number = 0;
  compareItemCount: number = 0;
  cartSubscription?: Subscription;
  compareSubscription?: Subscription;
  updateSubscription?: Subscription;

  constructor(private productService: ProductService) {}
  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
    this.compareSubscription?.unsubscribe();
    this.updateSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.updateCartAndCompareCount();
    // Lắng nghe sự kiện cập nhật danh sách so sánh
    this.updateSubscription = this.productService.getCompareListUpdated().subscribe(() => {
      console.log('Compare list updated, refreshing count...');
      this.updateCartAndCompareCount();
    });
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

  updateCartAndCompareCount(): void {
    this.cartSubscription?.unsubscribe();
    this.compareSubscription?.unsubscribe();

    this.cartSubscription = this.productService.getCartItems().subscribe({
      next: (cartItems) => {
        this.cartItemCount = cartItems?.length || 0;
        console.log('Updated cartItemCount:', this.cartItemCount);
      },
      error: (error) => {
        console.error('Error fetching cart items:', error);
      }
    });

    this.compareSubscription = this.productService.getCompareItems().subscribe({
      next: (compareItems: string[]) => {
        this.compareItemCount = compareItems?.length || 0;
        console.log('Updated compareItemCount:', this.compareItemCount);
      },
      error: (error: any) => {
        console.error('Error fetching compare items:', error);
      }
    });
  }
}