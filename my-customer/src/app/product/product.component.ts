import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Subscription } from 'rxjs';
import { Product, Pagination } from '../classes/Product';
import { MatSnackBar } from '@angular/material/snack-bar';
<<<<<<< HEAD
import { Router } from '@angular/router';
=======
import { Router } from '@angular/router'; // Thêm Router
>>>>>>> cus_blog

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  products: Product[] = [];
  pagination: Pagination = new Pagination();
<<<<<<< HEAD
  categories: { CateID: string, CateName: string }[] = [];
  brands: string[] = [];
  wineVolumes: string[] = [];
  wineTypes: string[] = [];
=======
  categories: { CateID: string, CateName: string }[] = [];  // Lưu danh sách danh mục từ API
  brands: string[] = [];      // Lưu danh sách thương hiệu từ API
  wineVolumes: string[] = []; // Lưu danh sách dung tích rượu từ API
  wineTypes: string[] = [];   // Lưu danh sách loại rượu từ API
>>>>>>> cus_blog

  selectedCategory: string = '';
  selectedBrand: string = '';
  selectedWineVolume: string = '';
  selectedWineType: string = '';

  filters: any = {
    category: '',
    minPrice: null,
    maxPrice: null,
    brand: '',
    wineVolume: '',
    wineType: '',
    bestSellers: false,
    onSale: false,
    sort: 'priceDesc'
  };

<<<<<<< HEAD
  constructor(private productService: ProductService, private snackBar: MatSnackBar, private router: Router) {}

=======
  constructor(private productService: ProductService, private snackBar: MatSnackBar, private router: Router) {}  
>>>>>>> cus_blog
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadFilterData();
<<<<<<< HEAD
    this.loadCategories();
  }

=======
    this.loadCategories()
  }
>>>>>>> cus_blog
  goToProductDetail(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  loadProducts(page: number = 1): void {
    this.productService.getProducts(this.filters, page).subscribe({
      next: (data) => {
        console.log("Product data received:", data);
<<<<<<< HEAD
        this.products = data.data.map(product => ({
          ...product,
          currentPrice: product.currentPrice ?? product.ProductPrice ?? 0,
          originalPrice: product.originalPrice ?? product.ProductPrice ?? 0,
          stockStatus: product.stockStatus ?? 'In Stock',
          isOnSale: !!product.isOnSale,
          discountPercentage: product.discountPercentage ?? 0,
          averageRating: product.averageRating ?? undefined, // Đảm bảo không undefined
          totalReviewCount: product.totalReviewCount ?? 0 // Đảm bảo không undefined
        }));
=======
        this.products = data.data;
>>>>>>> cus_blog
        this.pagination = data.pagination;
        
        this.products.forEach(product => {
          if (product.ImageID) {
            this.loadImage(product);
          } else {
            console.warn(`Product ${product.ProductName} has no ImageID`);
<<<<<<< HEAD
            product.ProductImageCover = 'assets/images/default-product.png';
=======
            product.ProductImageCover = 'assets/images/default-product.png'; // Đặt mặc định nếu không có ImageID
>>>>>>> cus_blog
          }
        });
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Không thể tải danh sách sản phẩm!', 'OK', { duration: 3000 });
      }
    });
  }
<<<<<<< HEAD



=======
  
>>>>>>> cus_blog
  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => {
        console.log("Categories received:", data);
<<<<<<< HEAD
        this.categories = data;
=======
        this.categories = data; // Đảm bảo lưu cả CateID và CateName
>>>>>>> cus_blog
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }
<<<<<<< HEAD

  loadImage(product: Product): void {
    if (!product.ImageID) {
      product.ProductImageCover = 'assets/images/default-product.png';
      return;
    }
    const sub = this.productService.getImage(product.ImageID).subscribe({
      next: (imageData) => {
        product.ProductImageCover = imageData.ProductImageCover || 'assets/images/default-product.png';
      },
      error: (error) => {
        console.warn(`Failed to load image for ${product.ProductName}: ${error.message}`);
        product.ProductImageCover = 'assets/images/default-product.png';
      }
    });
    this.subscriptions.push(sub);
  }
=======
  
  

loadImage(product: Product): void {
  if (!product.ImageID) {
    product.ProductImageCover = 'assets/images/default-product.png';
    return;
  }
  const sub = this.productService.getImage(product.ImageID).subscribe({
    next: (imageData) => {
      product.ProductImageCover = imageData.ProductImageCover || 'assets/images/default-product.png';
    },
    error: (error) => {
      console.warn(`Failed to load image for ${product.ProductName}: ${error.message}`);
      product.ProductImageCover = 'assets/images/default-product.png';
    }
  });
  this.subscriptions.push(sub);
}



>>>>>>> cus_blog

  loadFilterData(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
<<<<<<< HEAD
        this.categories = categories;
      },
      error: (error) => console.error('Error loading categories:', error)
    });

    this.productService.getFilters().subscribe({
      next: (data) => {
        this.brands = data.brands || [];
        this.wineVolumes = data.wineVolumes || [];
        this.wineTypes = data.wineTypes || [];
=======
        this.categories = categories; // Lưu danh sách danh mục với CateID và CateName
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  
    // Nếu cần các bộ lọc khác (brands, wineVolumes, wineTypes), dùng API /api/filters ở trên
    this.productService.getFilters().subscribe({
      next: (data) => {
        this.brands = data.brands;
        this.wineVolumes = data.wineVolumes;
        this.wineTypes = data.wineTypes;
>>>>>>> cus_blog
      },
      error: (error) => console.error('Error loading filters:', error)
    });
  }
<<<<<<< HEAD

=======
>>>>>>> cus_blog
  onFilterChange(): void {
    this.filters = {
      ...this.filters,
      category: this.selectedCategory,
      brand: this.selectedBrand,
      wineVolume: this.selectedWineVolume,
      wineType: this.selectedWineType
    };
<<<<<<< HEAD
    this.loadProducts();
  }
=======
    
    this.loadProducts();
  }
  
  
  
>>>>>>> cus_blog

  onPageChange(page: number): void {
    this.loadProducts(page);
  }

  addToCart(product: Product): void {
    this.productService.addToCart(product._id, 1).subscribe({
      next: () => this.snackBar.open('Đã thêm vào giỏ hàng!', 'OK', { duration: 3000 }),
      error: (error) => console.error('Error adding to cart:', error.message)
    });
  }

<<<<<<< HEAD
  addToCompare(product: Product): void {
    console.log('Adding to compare, productId:', product._id);
    this.productService.addToCompare(product._id.toString()).subscribe({
      next: (response) => {
        console.log('Add to compare response:', response);
=======
  // Trong product.component.ts hoặc product-detail.component.ts
  addToCompare(product: Product): void {
    console.log('Adding to compare, productId:', product._id); // Log để kiểm tra
    this.productService.addToCompare(product._id.toString()).subscribe({
      next: (response) => {
        console.log('Add to compare response:', response); // Log để kiểm tra
>>>>>>> cus_blog
        this.snackBar.open('Đã thêm vào danh sách so sánh!', 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error adding to compare:', error);
        this.snackBar.open('Lỗi khi thêm vào danh sách so sánh', 'Close', { duration: 3000 });
      }
    });
  }

<<<<<<< HEAD
=======
  
>>>>>>> cus_blog
  getPageNumbers(): number[] {
    const total = this.pagination.totalPages;
    const current = this.pagination.currentPage;
    const maxDisplay = 5;
    let start = Math.max(1, current - Math.floor(maxDisplay / 2));
    let end = Math.min(total, start + maxDisplay - 1);
    if (end - start + 1 < maxDisplay) start = Math.max(1, end - maxDisplay + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
<<<<<<< HEAD
=======
  
>>>>>>> cus_blog
}