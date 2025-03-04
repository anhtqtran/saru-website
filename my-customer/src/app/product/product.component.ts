import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../classes/\IProduct';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})

export class ProductComponent implements OnInit {
  products: Product[] = [];
  errorMessage: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(filters: any = {}) {
    this.productService.getProducts(filters).subscribe({
      next: (data) => (this.products = data),
      error: (err) => (this.errorMessage = err)
    });
  }

  filterProducts() {
    const filters = {
      category: (document.getElementById('category') as HTMLSelectElement)?.value || '',
      minPrice: (document.getElementById('minPrice') as HTMLInputElement)?.value || '',
      maxPrice: (document.getElementById('maxPrice') as HTMLInputElement)?.value || '',
      wineType: (document.getElementById('wineType') as HTMLSelectElement)?.value || '',
      brand: (document.getElementById('brand') as HTMLSelectElement)?.value || '',
      wineVolume: (document.getElementById('wineVolume') as HTMLSelectElement)?.value || '',
      netContent: (document.getElementById('netContent') as HTMLSelectElement)?.value || ''
    };
    this.loadProducts(filters);
  }

  addToCart(product: Product) {
    // Logic thêm vào giỏ hàng (sẽ triển khai ở bài sau)
    console.log('Added to cart:', product.productName);
  }

  addToCompare(product: Product) {
    if (product.productCategory === 'Rượu Tây Bắc') {
      console.log('Added to compare:', product.productName);
    } else {
      alert('Chỉ sản phẩm Rượu Tây Bắc mới có thể so sánh!');
    }
  }
}