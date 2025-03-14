import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service'; // Thêm CartService
import { Subscription } from 'rxjs';
import { Product, Pagination } from '../classes/Product';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
  categories: { CateID: string, CateName: string }[] = [];
  brands: string[] = [];
  wineVolumes: string[] = [];
  wineTypes: string[] = [];

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

  constructor(
    private productService: ProductService,
    private cartService: CartService, // Thêm CartService
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadFilterData();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  goToProductDetail(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  loadProducts(page: number = 1): void {
    const sub = this.productService.getProducts(this.filters, page).subscribe({
      next: (data) => {
        console.log('Product data received:', data);
        this.products = data.data.map(product => ({
          ...product,
          currentPrice: product.currentPrice ?? product.ProductPrice ?? 0,
          originalPrice: product.originalPrice ?? product.ProductPrice ?? 0,
          stockStatus: product.stockStatus ?? 'In Stock',
          isOnSale: !!product.isOnSale,
          discountPercentage: product.discountPercentage ?? 0,
          averageRating: product.averageRating ?? undefined,
          totalReviewCount: product.totalReviewCount ?? 0
        }));
        this.pagination = data.pagination;

        this.products.forEach(product => {
          if (product.ImageID) {
            this.loadImage(product);
          } else {
            console.warn(`Product ${product.ProductName} has no ImageID`);
            product.ProductImageCover = 'assets/images/default-product.png';
          }
        });
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Không thể tải danh sách sản phẩm!', 'OK', { duration: 3000 });
      }
    });
    this.subscriptions.push(sub);
  }

  loadCategories(): void {
    const sub = this.productService.getCategories().subscribe({
      next: (data) => {
        console.log('Categories received:', data);
        this.categories = data;
      },
      error: (error) => console.error('Error loading categories:', error)
    });
    this.subscriptions.push(sub);
  }

  loadImage(product: Product): void {
    if (!product.ImageID) {
      product.ProductImageCover = 'assets/images/default-product.png';
      return;
    }
    const sub = this.productService.getImage(product.ImageID).subscribe({
      next: (imageData) => {
        product.ProductImageCover = imageData?.ProductImageCover || 'assets/images/default-product.png';
      },
      error: (error) => {
        console.warn(`Failed to load image for ${product.ProductName}: ${error.message}`);
        product.ProductImageCover = 'assets/images/default-product.png';
      }
    });
    this.subscriptions.push(sub);
  }

  loadFilterData(): void {
    const subCategories = this.productService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (error) => console.error('Error loading categories:', error)
    });
    const subFilters = this.productService.getFilters().subscribe({
      next: (data) => {
        this.brands = data.brands || [];
        this.wineVolumes = data.wineVolumes || [];
        this.wineTypes = data.wineTypes || [];
      },
      error: (error) => console.error('Error loading filters:', error)
    });
    this.subscriptions.push(subCategories, subFilters);
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
    const cartItem = {
      id: product._id,
      name: product.ProductName,
      price: product.currentPrice || product.ProductPrice,
      image: product.ProductImageCover,
      quantity: 1
    };
    this.cartService.addToCart(cartItem); // Thêm vào giỏ hàng cục bộ
    this.snackBar.open(`${product.ProductName} đã được thêm vào giỏ hàng!`, 'OK', { duration: 3000 });
    console.log('🛒 Đã thêm vào giỏ hàng:', cartItem);

    // Tùy chọn: Gọi API nếu cần đồng bộ với server
    this.productService.addToCart(product._id, 1).subscribe({
      next: () => console.log('Added to cart on server'),
      error: (error) => console.error('Error adding to cart on server:', error)
    });
  }

  addToCompare(product: Product): void {
    console.log('Adding to compare, productId:', product._id);
    const sub = this.productService.addToCompare(product._id.toString()).subscribe({
      next: (response) => {
        console.log('Add to compare response:', response);
        this.snackBar.open('Đã thêm vào danh sách so sánh!', 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error adding to compare:', error);
        this.snackBar.open('Lỗi khi thêm vào danh sách so sánh', 'Close', { duration: 3000 });
      }
    });
    this.subscriptions.push(sub);
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