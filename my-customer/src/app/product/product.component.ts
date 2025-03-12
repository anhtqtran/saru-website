import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Subscription } from 'rxjs';
import { Product, Pagination } from '../classes/Product';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router'; // Thêm Router

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
  categories: { CateID: string, CateName: string }[] = [];  // Lưu danh sách danh mục từ API
  brands: string[] = [];      // Lưu danh sách thương hiệu từ API
  wineVolumes: string[] = []; // Lưu danh sách dung tích rượu từ API
  wineTypes: string[] = [];   // Lưu danh sách loại rượu từ API

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

  constructor(private productService: ProductService, private snackBar: MatSnackBar, private router: Router) {}  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadFilterData();
    this.loadCategories()
  }
  goToProductDetail(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  loadProducts(page: number = 1): void {
    this.productService.getProducts(this.filters, page).subscribe({
      next: (data) => {
        console.log("Product data received:", data);
        this.products = data.data;
        this.pagination = data.pagination;
        
        this.products.forEach(product => {
          if (product.ImageID) {
            this.loadImage(product);
          } else {
            console.warn(`Product ${product.ProductName} has no ImageID`);
            product.ProductImageCover = 'assets/images/default-product.png'; // Đặt mặc định nếu không có ImageID
          }
        });
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Không thể tải danh sách sản phẩm!', 'OK', { duration: 3000 });
      }
    });
  }
  
  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => {
        console.log("Categories received:", data);
        this.categories = data; // Đảm bảo lưu cả CateID và CateName
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }
  
  

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




  loadFilterData(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
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
      },
      error: (error) => console.error('Error loading filters:', error)
    });
  }
  onFilterChange(): void {
    this.filters = {
      ...this.filters,
      category: this.selectedCategory,
      brand: this.selectedBrand,
      wineVolume: this.selectedWineVolume,
      wineType: this.selectedWineType
    };
    
    this.loadProducts();
  }
  
  
  

  onPageChange(page: number): void {
    this.loadProducts(page);
  }

  addToCart(product: Product): void {
    this.productService.addToCart(product._id, 1).subscribe({
      next: () => this.snackBar.open('Đã thêm vào giỏ hàng!', 'OK', { duration: 3000 }),
      error: (error) => console.error('Error adding to cart:', error.message)
    });
  }

  // Trong product.component.ts hoặc product-detail.component.ts
  addToCompare(product: Product): void {
    console.log('Adding to compare, productId:', product._id);
    this.productService.addToCompare(product._id.toString()).subscribe({
      next: (response) => {
        console.log('Add to compare response:', response);
        this.snackBar.open('Đã thêm vào danh sách so sánh!', 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error adding to compare:', error);
        this.snackBar.open('Lỗi khi thêm vào danh sách so sánh', 'Close', { duration: 3000 });
      }
    });
  }

  
  getPageNumbers(): number[] {
    const total = this.pagination.totalPages;
    const current = this.pagination.currentPage;
    const maxDisplay = 5;
    let start = Math.max(1, current - Math.floor(maxDisplay / 2));
    let end = Math.min(total, start + maxDisplay - 1);
    if (end - start + 1 < maxDisplay) start = Math.max(1, end - maxDisplay + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  
}