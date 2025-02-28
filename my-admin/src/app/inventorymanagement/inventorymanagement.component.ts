import { Component, OnInit } from '@angular/core';

interface Product {
  name: string;
  sku: string;
  quantity: number;
  image: string;
}

@Component({
  selector: 'app-inventorymanagement',
  standalone: false,
  templateUrl: './inventorymanagement.component.html',
  styleUrl: './inventorymanagement.component.css'
})
export class InventorymanagementComponent implements OnInit {
  allProducts: Product[] = [];  // Danh sách đầy đủ sản phẩm
  displayedProducts: Product[] = [];
  selectedRows = 20; // Số lượng sản phẩm hiển thị mặc định

  constructor() {}

  ngOnInit(): void {
    // Giả lập danh sách sản phẩm
    this.allProducts = Array.from({ length: 100 }, (_, i) => ({
      name: `Sản phẩm ${i + 1}`,
      sku: `SKU${i + 1}`,
      quantity: Math.floor(Math.random() * 100),
      image: 'assets/images/product-placeholder.png'
    }));

    this.updateTableRows();
  }

  updateTableRows(): void {
    this.displayedProducts = this.allProducts.slice(0, this.selectedRows);
  }

  // Tăng số lượng của sản phẩm tại vị trí index
  increaseQuantity(index: number): void {
    this.displayedProducts[index].quantity++;
  }

  // Giảm số lượng của sản phẩm tại vị trí index (không giảm xuống dưới 0)
  decreaseQuantity(index: number): void {
    if (this.displayedProducts[index].quantity > 0) {
      this.displayedProducts[index].quantity--;
    }
  }

  // Reset số lượng của sản phẩm tại dòng được bấm về 0
  resetQuantity(index: number): void {
    this.displayedProducts[index].quantity = 0;
  }
}

