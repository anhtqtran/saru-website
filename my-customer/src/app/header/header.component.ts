import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { BlogService } from '../services/blog.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isSearchOpen = false;
  cartItemCount: number = 0;
  compareItemCount: number = 0;
  cartSubscription?: Subscription;
  compareSubscription?: Subscription;
  updateSubscription?: Subscription;
  loginStatusSubscription?: Subscription;
  routeSubscription?: Subscription;
  isLoggedIn: boolean = false;
  currentUser: any = null;
  blogCategories: { _id: string; CateblogID: string; CateblogName: string }[] = [];

  constructor(
    private productService: ProductService,
    public authService: AuthService,
    private blogService: BlogService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadBlogCategories();

    const token = localStorage.getItem('authToken');
    console.log('Auth token:', token);
    this.updateCartAndCompareCount();
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.authService.getCurrentUser();

    // Lắng nghe thay đổi trạng thái đăng nhập
    this.loginStatusSubscription = this.authService.getLoginStatus().subscribe(status => {
      this.isLoggedIn = status;
      this.currentUser = status ? this.authService.getCurrentUser() : null;
      console.log('Login status changed:', status, 'Current user:', this.currentUser);
      if (status) {
        this.updateCartAndCompareCount(); // Làm mới dữ liệu khi đăng nhập
      } else {
        this.cartItemCount = 0;
        this.compareItemCount = 0;
      }
    });

    // Lắng nghe sự kiện cập nhật danh sách so sánh
    this.updateSubscription = this.productService.getCompareListUpdated().subscribe(() => {
      console.log('Compare list updated, refreshing count...');
      this.updateCartAndCompareCount();
    });

    // Sử dụng cart$ và compare$ từ ProductService để đồng bộ realtime
    this.cartSubscription = this.productService.cart$.subscribe(cart => {
      this.cartItemCount = cart?.length || 0;
      console.log('Cart updated via Observable:', this.cartItemCount);
    });

    this.compareSubscription = this.productService.compare$.subscribe(compare => {
      this.compareItemCount = compare?.length || 0;
      console.log('Compare updated via Observable:', this.compareItemCount);
    });
    
    // Lắng nghe thay đổi đường dẫn để cập nhật nội dung danh mục blog
    this.routeSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadBlogCategories(); // Gọi lại API khi đường dẫn thay đổi
      }
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
    this.compareSubscription?.unsubscribe();
    this.updateSubscription?.unsubscribe();
    this.loginStatusSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  // Gọi API để lấy danh sách danh mục blog
  loadBlogCategories() {
    this.blogService.getCategories().subscribe({
      next: (categories) => {
        this.blogCategories = categories; // Gán dữ liệu vào biến
        console.log('Danh mục blog:', this.blogCategories);
      },
      error: (err) => {
        console.error('Lỗi khi tải danh mục blog:', err);
      }
    });
  }

  toggleSearchBar(searchBox: HTMLInputElement) {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => searchBox.focus(), 0);
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

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.currentUser = null;
    this.cartItemCount = 0;
    this.compareItemCount = 0;
  }
}