import { Component, OnInit, OnDestroy } from '@angular/core';
import { HomepageProductsService } from '../services/homepage-products.service';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BestSellingProduct } from '../classes/BestSellingProduct';
import { ProductService } from '../services/product.service';
import { Blog } from '../classes/Blogs';
import { BlogapiService } from '../services/blogapi.service';
import { CartService } from '../services/cart.service';
import { FeedbacksapiService } from '../services/feedbacksapi.service';
import { Feedback } from '../classes/Feedbacks';
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
  feedbacks: Feedback[] = [];

  constructor(
    private productService: ProductService,
    private bestSellerService: HomepageProductsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private BlogService: BlogapiService,
    private cartService: CartService,
    private feedbackService: FeedbacksapiService,
  ) {}

  ngOnInit(): void {
    // Tải danh sách bài viết ngẫu nhiên
    this.loadRandomBlogs();

    // Tải danh sách sản phẩm bán chạy
    this.loadBestSellers();

    // Tải danh sách productId của sản phẩm bán chạy
    this.loadBestSellerIds();

    //tải danh sách feedbacks
    this.loadFeedbacks();
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

  // Định dạng sản phẩm để phù hợp với CartService
  const productToAdd = {
    id: product.productId, // Sử dụng productId làm id
    name: product.productName,    // Giả sử BestSellingProduct có name
    price: product.productPrice,
    image: product.productImageCover  // Giả sử BestSellingProduct có price
    // Thêm các thuộc tính khác nếu cần (image, description, v.v.)
  };

  // Gọi phương thức addToCart từ CartService
  this.cartService.addToCart(productToAdd);

  // Hiển thị thông báo thành công
  console.log('Cart updated:', this.cartService.getCart());
  this.snackBar.open('Đã thêm vào giỏ hàng!', 'OK', { duration: 3000 });
}

  loadFeedbacks(): void {
    const feedbacksSub = this.feedbackService.getFeedbacks().subscribe({
      next: (feedbacks) => {
        this.feedbacks = feedbacks;
        console.log('Feedbacks loaded:', feedbacks);
      },
      error: (error) => {
        console.error('Error fetching feedbacks:', error);
        this.snackBar.open('Không thể tải phản hồi. Vui lòng thử lại!', 'Đóng', { duration: 3000 });
      }
    });
    this.subscriptions.push(feedbacksSub);
  }

  // So sánh sản phẩm
  addToCompare(product: BestSellingProduct): void {
    console.log('Product to compare:', product); // Log toàn bộ object product
    console.log('Product ID:', product.productId); // Log riêng productId
  
    if (!product.productId || typeof product.productId !== 'string' || product.productId.trim() === '') {
      console.error('Invalid or missing productId:', product.productId);
      this.snackBar.open('Lỗi: ID sản phẩm không hợp lệ.', 'Đóng', { duration: 3000 });
      return;
    }
  
    // Ánh xạ productId sang ObjectId
    this.bestSellerService.getObjectIdFromProductId(product.productId).subscribe({
      next: (objectId) => {
        if (objectId && /^[0-9a-fA-F]{24}$/.test(objectId)) {
          const subscription = this.productService.addToCompare(objectId).subscribe({
            next: (response) => {
              console.log('Add to compare response:', response);
              this.snackBar.open('Đã thêm vào danh sách so sánh!', 'OK', { duration: 3000 });
              if (response.success) {
                this.productService.notifyCompareListUpdated();
              }
            },
            error: (error) => {
              console.error('Error adding to compare:', error.message);
              this.snackBar.open(`Lỗi khi thêm vào danh sách so sánh: ${error.message}`, 'Đóng', { duration: 3000 });
            }
          });
          this.subscriptions.push(subscription);
        } else {
          console.error('Invalid ObjectId after mapping:', objectId);
          this.snackBar.open('ID sản phẩm không hợp lệ sau khi ánh xạ.', 'Đóng', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error mapping productId to ObjectId:', error);
        this.snackBar.open('Lỗi khi ánh xạ ID sản phẩm.', 'Đóng', { duration: 3000 });
      }
    });
  }

}