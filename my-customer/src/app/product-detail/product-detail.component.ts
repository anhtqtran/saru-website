import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../classes/Product';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  selectedImage: string | undefined;
  activeTab: string = 'description';
  isLoading: boolean = true;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProductDetail(id);
      } else {
        this.isLoading = false;
      }
    });
  }

  loadProductDetail(id: string): void {
    this.isLoading = true;
    this.productService.getProductDetail(id).subscribe({
        next: (data: Product) => {
          if (!data.reviews) data.reviews = [];
          console.log('Review data:', data.reviews);
            console.log('Product data from API:', data);
            console.log('Related products _id:', data.relatedProducts?.map(rp => rp._id) || []);
            // **Thêm LOG kiểu dữ liệu _id của sản phẩm liên quan VÀO ĐÂY:**
            if (data.relatedProducts && data.relatedProducts.length > 0) {
                console.log('Kiểu dữ liệu _id sản phẩm liên quan đầu tiên:', typeof data.relatedProducts[0]._id);
                console.log('Constructor name _id sản phẩm liên quan đầu tiên:', data.relatedProducts[0]._id.constructor.name);
            }

            this.product = { ...data };
            this.selectedImage = this.product.ProductImageCover || 'assets/images/default-product.png';
            this.isLoading = false;
        },
        error: (error) => {
            console.error('Error loading product detail:', error.message);
            this.isLoading = false;
        }
    });
}

  selectImage(image: string): void {
    this.selectedImage = image || 'assets/images/default-product.png';
  }

  addToCart(product: Product): void {
    if (product) {
      this.productService.addToCart(product._id, 1).subscribe({
        next: () => this.snackBar.open('Đã thêm vào giỏ hàng!', 'OK', { duration: 3000 }),
        error: (error) => console.error('Error adding to cart:', error.message)
      });
    }
  }

  addToCompare(product: Product): void {
    if (product) {
      this.productService.addToCompare(product._id, 1).subscribe({
        next: () => this.snackBar.open('Đã thêm vào danh sách so sánh!', 'OK', { duration: 3000 }),
        error: (error) => console.error('Error adding to compare:', error.message)
      });
    }
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  getStarArray(rating: number | undefined): number[] {
    const roundedRating = Math.round(rating || 0);
    return Array(roundedRating > 5 ? 5 : roundedRating).fill(0);
  }

  getEmptyStarArray(rating: number | undefined): number[] {
    const roundedRating = Math.round(rating || 0);
    return Array(5 - (roundedRating > 5 ? 5 : roundedRating)).fill(0);
  }

// Phương thức điều hướng đến trang chi tiết sản phẩm
goToProductDetail(event: Event, productId: string): void {
  event.stopPropagation(); // Dừng lan truyền sự kiện
  console.log('Clicked product ID:', productId); // Thêm log này
  
  if (!productId) {
    console.error('Invalid productId:', productId);
    return;
  }

  // Thêm dòng này để ngăn sự kiện click lan ra các phần tử cha
  event.stopPropagation(); 
  
  this.router.navigate(['/products', productId]).then(navigationResult => {
    console.log('Navigation success:', navigationResult);
    if (!navigationResult) {
      console.error('Navigation failed, check route config');
    }
  });
}

}