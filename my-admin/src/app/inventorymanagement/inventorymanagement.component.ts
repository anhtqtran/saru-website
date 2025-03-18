import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../services/inventory.service';
import { ProductStock, Product, InventoryProduct } from '../classes/Inventory';

@Component({
  selector: 'app-inventorymanagement',
  templateUrl: './inventorymanagement.component.html',
  styleUrls: ['./inventorymanagement.component.css'],
  standalone:false
})
export class InventorymanagementComponent implements OnInit {
  allProducts: InventoryProduct[] = [];
  displayedProducts: InventoryProduct[] = [];
  selectedRows = 10;
  selectAll: boolean = false;
  selectedProducts: Set<number> = new Set(); 

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadInventoryData();
  }

  loadInventoryData(): void {
    this.inventoryService.getStockData().subscribe({
      next: (stockData) => {
        console.log('Dữ liệu tồn kho:', stockData);
  
        this.allProducts = stockData.map(stock => ({
          ProductID: stock.ProductID,
          CateID: stock.CateID || 'N/A',  // ✅ Nếu thiếu CateID, gán giá trị mặc định
          ProductName: stock.ProductName || 'Không xác định',
          ProductSKU: stock.ProductSKU || 'N/A',
          StockQuantity: stock.StockQuantity,
        }));
  
        this.updateTableRows();
      },
      error: (err) => {
        console.error('❌ Lỗi khi lấy dữ liệu tồn kho:', err);
      }
    });
  }
  
  
  updateTableRows(): void {
    this.displayedProducts = this.allProducts.slice(0, this.selectedRows);
  }

  increaseQuantity(index: number): void {
    this.displayedProducts[index].StockQuantity++;
  }

  decreaseQuantity(index: number): void {
    if (this.displayedProducts[index].StockQuantity > 0) {
      this.displayedProducts[index].StockQuantity--;
    }
  }

  resetQuantity(index: number): void {
    this.displayedProducts[index].StockQuantity = 0;
  }

  toggleAllSelection(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.displayedProducts.forEach((_, index) => {
        this.selectedProducts.add(index);
      });
    } else {
      this.selectedProducts.clear();
    }
  }

  toggleSelection(index: number): void {
    if (this.selectedProducts.has(index)) {
      this.selectedProducts.delete(index);
    } else {
      this.selectedProducts.add(index);
    }

    this.selectAll = this.selectedProducts.size === this.displayedProducts.length;
  }
}



