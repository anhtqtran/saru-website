import { Component, OnDestroy, OnInit } from '@angular/core';
<<<<<<< HEAD

import { Subscription } from 'rxjs';
import { Pagination } from '../classes/Product';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router'; // Thêm Router
import { ProductService } from '../services/product.service';
// import { IProduct } from '../classes/IProduct';
import { Product } from '../classes/Product';
import { CartService } from '../services/cart.service';

=======
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service'; // Thêm CartService
import { Subscription } from 'rxjs';
import { Product, Pagination } from '../classes/Product';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
>>>>>>> main

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
  categories: { CateID: string, CateName: string }[] = [];  // Lưu danh sách danh mục từ API
  brands: string[] = [];      // Lưu danh sách thương hiệu từ API
  wineVolumes: string[] = []; // Lưu danh sách dung tích rượu từ API
  wineTypes: string[] = [];   // Lưu danh sách loại rượu từ API

=======
  categories: { CateID: string, CateName: string }[] = [];
  brands: string[] = [];
  wineVolumes: string[] = [];
  wineTypes: string[] = [];
>>>>>>> main

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
  constructor(private productService: ProductService, private snackBar: MatSnackBar, private router: Router, private cartService: CartService,) { }
=======
  constructor(
    private productService: ProductService,
    private cartService: CartService, // Thêm CartService
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute

  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        const category = params['category'] || '';
        if (category !== this.filters.category) { 
          this.filters.category = category; 
          this.selectedCategory = category; 
          console.log('Category from query params:', category);
          this.loadProducts(); 
        }
      })
    );
    this.loadProducts();
    this.loadFilterData();
    this.loadCategories();
  }

>>>>>>> main
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

<<<<<<< HEAD
  ngOnInit(): void {
    this.loadProducts();
    this.loadFilterData();
    this.loadCategories()
  }
=======
>>>>>>> main
  goToProductDetail(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  loadProducts(page: number = 1): void {
<<<<<<< HEAD
    this.productService.getProducts(this.filters, page).subscribe({
      next: (data) => {
        console.log("Product data received:", data);
        this.products = data.data;
=======
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
>>>>>>> main
        this.pagination = data.pagination;

        this.products.forEach(product => {
          if (product.ImageID) {
            this.loadImage(product);
          } else {
            console.warn(`Product ${product.ProductName} has no ImageID`);
<<<<<<< HEAD
          }
        });
      },
      error: (error) => console.error('Error loading products:', error)
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


=======
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

>>>>>>> main
  loadImage(product: Product): void {
    if (!product.ImageID) {
      product.ProductImageCover = 'assets/images/default-product.png';
      return;
    }
<<<<<<< HEAD
    this.productService.getImage(product.ImageID).subscribe({
=======
    const sub = this.productService.getImage(product.ImageID).subscribe({
>>>>>>> main
      next: (imageData) => {
        product.ProductImageCover = imageData?.ProductImageCover || 'assets/images/default-product.png';
      },
      error: (error) => {
<<<<<<< HEAD
        console.warn(`Không thể tải ảnh cho sản phẩm ${product.ProductName}: ${error.message}`);
        product.ProductImageCover = 'assets/images/default-product.png';
      }
    });
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
=======
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

>>>>>>> main
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

>>>>>>> main
  onPageChange(page: number): void {
    this.loadProducts(page);
  }

<<<<<<< HEAD
  // addToCart(product: Product): void {
  //   this.productService.addToCart(product._id, 1).subscribe({
  //     next: () => this.snackBar.open('Đã thêm vào giỏ hàng!', 'OK', { duration: 3000 }),
  //     error: (error) => console.error('Error adding to cart:', error.message)
  //   });
  // }

  // Trong product.component.ts hoặc product-detail.component.ts
  addToCompare(product: Product): void {
    console.log('Adding to compare, productId:', product._id); // Log để kiểm tra
    this.productService.addToCompare(product._id.toString()).subscribe({
      next: (response) => {
        console.log('Add to compare response:', response); // Log để kiểm tra
=======
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
>>>>>>> main
        this.snackBar.open('Đã thêm vào danh sách so sánh!', 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error adding to compare:', error);
        this.snackBar.open('Lỗi khi thêm vào danh sách so sánh', 'Close', { duration: 3000 });
      }
    });
<<<<<<< HEAD
  }


=======
    this.subscriptions.push(sub);
  }

>>>>>>> main
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

  addToCart(product: any): void {
    const cartItem = {
      id: product._id, // Đảm bảo có ID
      name: product.ProductName,
      price: product.ProductPrice,
      image: product.ProductImageCover, // Đảm bảo gửi đúng ảnh
      quantity: 1
    };
  
    this.cartService.addToCart(cartItem);
    this.snackBar.open(`${product.ProductName} đã được thêm vào giỏ hàng!`, 'OK', { duration: 3000 });
    console.log("🛒 Đã thêm vào giỏ hàng:", cartItem);
  }
  
  // filterProducts() {
  //   const filters = {
  //     category: (document.getElementById('category') as HTMLSelectElement)?.value || '',
  //     minPrice: (document.getElementById('minPrice') as HTMLInputElement)?.value || '',
  //     maxPrice: (document.getElementById('maxPrice') as HTMLInputElement)?.value || '',
  //     wineType: (document.getElementById('wineType') as HTMLSelectElement)?.value || '',
  //     brand: (document.getElementById('brand') as HTMLSelectElement)?.value || '',
  //     wineVolume: (document.getElementById('wineVolume') as HTMLSelectElement)?.value || '',
  //     netContent: (document.getElementById('netContent') as HTMLSelectElement)?.value || ''
  //   };
  //   this.loadProducts(filters);
  // }



  

=======
>>>>>>> main
}