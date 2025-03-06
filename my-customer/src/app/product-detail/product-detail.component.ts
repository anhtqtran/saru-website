import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../classes/Product';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;

  constructor(private productService: ProductService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProductDetail(id);
    }
  }

  loadProductDetail(id: string): void {
    this.productService.getProductDetail(id).subscribe({
      next: (data) => {
        this.product = data; // Nhận ảnh từ API đã gộp
      },
      error: (error) => console.error('Error loading product detail:', error.message)
    });
}


  addToCart(): void {
    if (this.product) {
      this.productService.addToCart(this.product._id, 1).subscribe({
        next: () => alert('Added to cart successfully!'),
        error: (error) => console.error('Error adding to cart:', error.message)
      });
    }
  }

  addToCompare(): void {
    if (this.product) {
      this.productService.addToCompare(this.product._id).subscribe({
        next: () => alert('Added to compare list successfully!'),
        error: (error) => console.error('Error adding to compare:', error.message)
      });
    }
  }
}