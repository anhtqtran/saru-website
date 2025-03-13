import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { Pagination } from '../classes/Product';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router'; // Thêm Router
import { ProductService } from '../services/product.service';
// import { IProduct } from '../classes/IProduct';
import { Product } from '../classes/Product';
import { CartService } from '../services/cart.service';


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

  constructor(private productService: ProductService, private snackBar: MatSnackBar, private router: Router, private cartService: CartService,) { }
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


  loadImage(product: Product): void {
    if (!product.ImageID) {
      product.ProductImageCover = 'assets/images/default-product.png';
      return;
    }
    this.productService.getImage(product.ImageID).subscribe({
      next: (imageData) => {
        product.ProductImageCover = imageData?.ProductImageCover || 'assets/images/default-product.png';
      },
      error: (error) => {
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



  

}