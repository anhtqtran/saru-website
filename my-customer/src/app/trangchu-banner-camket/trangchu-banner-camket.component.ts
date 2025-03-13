<<<<<<< HEAD
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HomepageProductsService } from '../services/homepage-products.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BestSellingProduct } from '../classes/BestSellingProduct';
import { ProductService } from '../services/product.service';
import { Blog } from '../classes/Blogs';
import { BlogapiService } from '../services/blogapi.service';

@Component({
  selector: 'app-trangchu-banner-camket',
  templateUrl: './trangchu-banner-camket.component.html',
  styleUrls: ['./trangchu-banner-camket.component.css'],
  standalone: false
})
export class TrangchuBannerCamketComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  blogs: Blog[] = []; // Mảng chứa danh sách bài viết
  isLoading = true; // Trạng thái loading
  errorMessage: string | null = null; // Thông báo lỗi nếu có

  bestSellers: BestSellingProduct[] = [];
  bestSellerIds: string[] = [];

  constructor(
    private productService: ProductService,
    private bestSellerService: HomepageProductsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private BlogService: BlogapiService,
  ) {}

  ngOnInit(): void {
    // Tải danh sách bài viết ngẫu nhiên
    this.loadRandomBlogs();

    // Tải danh sách sản phẩm bán chạy
    this.loadBestSellers();

    // Tải danh sách productId của sản phẩm bán chạy
    this.loadBestSellerIds();
  }

  loadRandomBlogs(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.BlogService.getRandomBlogs('cateblog1').subscribe({
      next: (blogs) => {
        this.blogs = blogs;
        this.isLoading = false;
        console.log('Loaded blogs:', this.blogs);
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải bài viết. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading blogs:', error);
      }
    });
  }

  loadBestSellers(): void {
    const bestSellersSub = this.bestSellerService.getBestSellers().subscribe({
      next: (products) => {
        this.bestSellers = products;
        console.log('Best sellers loaded:', products);
      },
      error: (error) => {
        console.error('Error fetching best-selling products:', error);
        this.snackBar.open('Không thể tải sản phẩm bán chạy. Vui lòng thử lại!', 'Đóng', { duration: 3000 });
      }
    });
    this.subscriptions.push(bestSellersSub);
  }

  loadBestSellerIds(): void {
    const bestSellerIdsSub = this.bestSellerService.getBestSellerIds().subscribe({
      next: (ids) => {
        this.bestSellerIds = ids;
        console.log('Best seller IDs loaded from new service:', ids);
      },
      error: (error) => {
        console.error('Error fetching best seller IDs:', error);
        this.snackBar.open('Không thể tải ID sản phẩm bán chạy.', 'Đóng', { duration: 3000 });
      }
    });
    this.subscriptions.push(bestSellerIdsSub);
  }

  // Phương thức để chuyển hướng đến blog-detail
  navigateToBlogDetail(id: string): void {
    this.router.navigate(['/blog-detail', id]);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe()); // Hủy subscription khi component bị phá hủy
  }

  goToProductDetail(productId: string): void {
    // Ánh xạ ProductID sang ObjectId trước khi điều hướng
    this.bestSellerService.getObjectIdFromProductId(productId).subscribe({
      next: (objectId) => {
        if (objectId && /^[0-9a-fA-F]{24}$/.test(objectId)) {
          this.router.navigate(['/product-detail', objectId]).then(success => {
            if (!success) {
              console.error('Navigation failed');
              this.snackBar.open('Không thể vào trang chi tiết sản phẩm.', 'Đóng', { duration: 3000 });
            }
          });
        } else {
          this.snackBar.open('ID sản phẩm không hợp lệ sau ánh xạ.', 'Đóng', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error mapping productId to ObjectId:', error);
        this.snackBar.open('Không thể ánh xạ ID sản phẩm.', 'Đóng', { duration: 3000 });
      }
    });
  }

  // Thêm vào giỏ hàng
  addToCart(product: BestSellingProduct): void {
    if (!product.productId) {
      console.error('Product ID is missing:', product);
      this.snackBar.open('Lỗi: Không tìm thấy ID sản phẩm.', 'Đóng', { duration: 3000 });
      return;
    }
    const subscription = this.productService.addToCart(product.productId, 1).subscribe({
      next: (response) => {
        console.log('Cart response:', response);
        this.snackBar.open('Đã thêm vào giỏ hàng!', 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error adding to cart:', error.message);
        this.snackBar.open(`Lỗi khi thêm vào giỏ hàng: ${error.message}`, 'Đóng', { duration: 3000 });
      }
    });
    this.subscriptions.push(subscription); // Quản lý subscription
  }

  // So sánh sản phẩm
  addToCompare(product: BestSellingProduct): void {
    if (!product.productId) {
      console.error('Product ID is missing:', product);
      this.snackBar.open('Lỗi: Không tìm thấy ID sản phẩm.', 'Đóng', { duration: 3000 });
      return;
    }
    const subscription = this.bestSellerService.addToCompare(product.productId).subscribe({
      next: (response) => {
        console.log('Add to compare response:', response);
        this.snackBar.open('Đã thêm vào danh sách so sánh!', 'OK', { duration: 3000 });
        if (response.success) {
          this.bestSellerService.notifyCompareListUpdated();
        }
      },
      error: (error) => {
        console.error('Error adding to compare:', error.message);
        this.snackBar.open(`Lỗi khi thêm vào danh sách so sánh: ${error.message}`, 'Đóng', { duration: 3000 });
      }
    });
    this.subscriptions.push(subscription);
  }
}
=======
import { Component } from '@angular/core';

@Component({
  selector: 'app-trangchu-banner-camket',
  standalone: false,
  templateUrl: './trangchu-banner-camket.component.html',
  styleUrl: './trangchu-banner-camket.component.css'
})
export class TrangchuBannerCamketComponent {
  blogs = [
    { id: 1, title: 'Lịch sử rượu Tây Bắc - Tinh hoa vùng núi rừng', image: 'Blog 1.png', summary: 'Rượu Tây Bắc không chỉ là một loại thức uống mà còn là nét văn hóa truyền thống đặc sắc của các dân tộc vùng cao...' },
    { id: 2, title: 'Những loại rượu nổi tiếng ở Tây Bắc', image: 'Blog 2.png', summary: 'Tây Bắc nổi tiếng với nhiều loại rượu đặc trưng, mỗi loại mang một hương vị riêng biệt và gắn liền với đặc điểm tự nhiên của từng vùng...' }
  ];

  products = [
    { id: 1, name: 'KIM CHIẾT CORAVIN TIÊU CHUẨN', category: 'Phụ kiện', image: 'ruou nang man.png', rating: 5.0, reviews: 10, status: 'Còn hàng', price: 1386000 },
    { id: 2, name: 'TÁO MÈO KHÔ', category: 'Đồ ngâm rượu', image: 'ruou nang man.png', rating: 5.0, reviews: 10, status: 'Còn hàng', price: 140000 },
    { id: 3, name: 'SET QUÀ TẾT', category: 'Set quà rượu', image: 'ruou nang man.png', rating: 5.0, reviews: 10, status: 'Còn hàng', price: 699000 },
    { id: 4, name: 'RƯỢU NÀNG MẬN', category: 'Ruou Tay Bac', image: 'ruou nang man.png', rating: 5.0, reviews: 10, status: 'Còn hàng', price: 225000 },
    { id: 5, name: 'RƯỢU NÀNG MẬN', category: 'Ruou Tay Bac', image: 'ruou nang man.png', rating: 5.0, reviews: 10, status: 'Còn hàng', price: 225000 }
  ];

  addToCart(productName: string, price: number): void {
    alert(`${productName} đã được thêm vào giỏ hàng với giá ${price.toLocaleString()}đ!`);
  }

  compareProduct(product: any): void {
    alert(`So sánh sản phẩm: ${product.name} với các sản phẩm khác đang được phát triển!`);
  }
}
>>>>>>> cus_blog
