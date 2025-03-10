import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../classes/Product';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-compare',
  standalone: false,
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css']
})
export class CompareComponent implements OnInit {
  products: Product[] = [];
  isLoading: boolean = true;

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompareProducts();
  }

  loadCompareProducts(): void {
    console.log('Starting to load compare products...');
    this.isLoading = true;
    this.productService.getCompareItems().subscribe({
      next: (productIds: string[]) => {
        console.log('Received productIds from API:', productIds);
        if (productIds.length > 0) {
          const productObservables = productIds.map(id =>
            this.productService.getProductDetail(id)
          );
          console.log('Fetching details for productIds:', productIds);
          this.productService.combineLatest(productObservables).subscribe({
            next: (products: Product[]) => {
              console.log('Received product details:', products);
              this.products = products.filter(p => p !== null) as Product[];
              console.log('Filtered products to render:', this.products);
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading compare products:', error);
              this.snackBar.open('Error loading compare products', 'Close', { duration: 3000 });
              this.isLoading = false;
            }
          });
        } else {
          console.log('No products in compare list, setting products to empty array');
          this.products = [];
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching compare list:', error);
        this.snackBar.open('Error fetching compare list', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  removeFromCompare(productId: string): void {
    console.log('Removing product with id:', productId);
    this.productService.removeFromCompare(productId).subscribe({
      next: () => {
        this.snackBar.open('Removed from compare list', 'OK', { duration: 3000 });
        this.loadCompareProducts();
        this.productService.notifyCompareListUpdated();
      },
      error: (error) => {
        console.error('Error removing from compare:', error);
        this.snackBar.open('Error removing from compare', 'Close', { duration: 3000 });
      }
    });
  }

  clearAll(): void {
    console.log('Clearing all compare items...');
    this.productService.removeAllFromCompare().subscribe({
      next: (response) => {
        console.log('Clear all response:', response); // Thêm log để kiểm tra phản hồi
        this.snackBar.open('Cleared all compare items', 'OK', { duration: 3000 });
        this.loadCompareProducts(); // Reload danh sách
        this.productService.notifyCompareListUpdated(); // Cập nhật header
      },
      error: (error) => {
        console.error('Error clearing all compare items:', error);
        this.snackBar.open('Error clearing all compare items', 'Close', { duration: 3000 });
      }
    });
  }

  getColors(product: Product): string[] {
    return product.WineFlavor ? product.WineFlavor.split(',') : [];
  }

  goToProductList(): void {
    this.router.navigate(['/product']);
  }
}