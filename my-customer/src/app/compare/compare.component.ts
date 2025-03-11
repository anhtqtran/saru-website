import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../classes/Product';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-compare',
  standalone: false,
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css']
})
export class CompareComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoading = true;
  private subscriptions = new Subscription();

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Lắng nghe thay đổi từ compare$
    this.subscriptions.add(
      this.productService.compare$.subscribe((productIds: string[]) => {
        this.loadCompareProductsFromIds(productIds);
      })
    );

    // Lắng nghe thay đổi trạng thái đăng nhập
    this.subscriptions.add(
      this.productService.loginStatusChanged$.subscribe(() => {
        this.loadCompareProducts();
      })
    );

    // Tải danh sách so sánh ban đầu
    this.loadCompareProducts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadCompareProducts(): void {
    this.isLoading = true;
    this.productService.getCompareItems().pipe(
      take(1) // Đảm bảo chỉ lấy một lần để tránh memory leak
    ).subscribe({
      next: (productIds: string[]) => {
        this.loadCompareProductsFromIds(productIds);
      },
      error: (error) => this.handleError('Error fetching compare list', error)
    });
  }

  private loadCompareProductsFromIds(productIds: string[]): void {
    if (productIds?.length > 0) {
      const productObservables = productIds.map(id =>
        this.productService.getProductDetail(id)
      );
      this.productService.combineLatest(productObservables).pipe(
        take(1)
      ).subscribe({
        next: (products: Product[]) => {
          this.products = products; // combineLatest đã lọc null
          this.isLoading = false;
        },
        error: (error) => this.handleError('Error loading compare products', error)
      });
    } else {
      this.products = [];
      this.isLoading = false;
    }
  }

  removeFromCompare(productId: string): void {
    if (!productId) {
      this.showSnackBar('Invalid product ID');
      return;
    }

    this.productService.removeFromCompare(productId).pipe(
      take(1)
    ).subscribe({
      next: () => {
        this.showSnackBar('Removed from compare list', 'OK');
        // Không cần gọi loadCompareProducts vì ProductService đã tự động cập nhật compare$
      },
      error: (error) => this.handleError('Error removing from compare', error)
    });
  }

  clearAll(): void {
    this.productService.removeAllFromCompare().pipe(
      take(1)
    ).subscribe({
      next: () => {
        this.showSnackBar('Cleared all compare items', 'OK');
        // Không cần gọi loadCompareProducts vì ProductService đã tự động cập nhật compare$
      },
      error: (error) => this.handleError('Error clearing all compare items', error)
    });
  }

  getColors(product: Product): string[] {
    return product?.WineFlavor?.split(',').map(color => color.trim()) || [];
  }

  goToProductList(): void {
    this.router.navigate(['/product']);
  }

  private handleError(message: string, error: unknown): void {
    console.error(`${message}:`, error);
    this.showSnackBar(message);
    this.products = [];
    this.isLoading = false;
  }

  private showSnackBar(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, { duration: 3000 });
  }
}