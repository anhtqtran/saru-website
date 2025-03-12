import { Component, OnInit, OnDestroy } from '@angular/core';
import { HomepageProductsService } from '../services/homepage-products.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BestSellingProduct } from '../classes/BestSellingProduct';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-trangchu-banner-camket',
  templateUrl: './trangchu-banner-camket.component.html',
  styleUrls: ['./trangchu-banner-camket.component.css'],
  standalone: false
})
export class TrangchuBannerCamketComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  blogs = [
    { id: 1, title: 'Lịch sử rượu Tây Bắc - Tinh hoa vùng núi rừng', image: 'Blog 1.png', summary: 'Rượu Tây Bắc không chỉ là một loại thức uống mà còn là nét văn hóa truyền thống đặc sắc của các dân tộc vùng cao...' },
    { id: 2, title: 'Những loại rượu nổi tiếng ở Tây Bắc', image: 'Blog 2.png', summary: 'Tây Bắc nổi tiếng với nhiều loại rượu đặc trưng, mỗi loại mang một hương vị riêng biệt và gắn liền với đặc điểm tự nhiên của từng vùng...' }
  ];

  bestSellers: BestSellingProduct[] = [];
  bestSellerIds: string[] = [];

  constructor(
    private productService: ProductService,
    private bestSellerService: HomepageProductsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Lấy danh sách sản phẩm bán chạy
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

    // Lấy danh sách productId của sản phẩm bán chạy từ service mới
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

//So sánh sản phẩm
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