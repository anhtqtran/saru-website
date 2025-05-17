import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../services/inventory.service';
import { ProductStock, Product, InventoryProduct } from '../classes/Inventory';

@Component({
  selector: 'app-inventorymanagement',
  templateUrl: './inventorymanagement.component.html',
  styleUrls: ['./inventorymanagement.component.css'],
  standalone: false
})
export class InventorymanagementComponent implements OnInit {
  allProducts: InventoryProduct[] = [];
  displayedProducts: InventoryProduct[] = [];
  selectedRows = 10;
  selectAll: boolean = false;
  selectedProducts: Set<number> = new Set();
  filterCategory: string = '';
  filterBrand: string = '';
  categories: string[] = [];
  brands: string[] = [];
  // 🔹 Biến lọc
  selectedFilterType: string = 'CateName';  // Mặc định lọc theo nhóm sản phẩm
  selectedFilterValue: string = ''; 
  filterOptions: string[] = [];  // Danh sách tùy chọn lọc (sẽ cập nhật tự động)
  searchQuery: string = '';

  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.loadInventoryData();
    this.loadFilterOptions(); // 🆕 Load danh sách nhóm & thương hiệu
  }

  loadFilterOptions(): void {
    this.inventoryService.getProducts().subscribe({
      next: (response) => {
        const products = response.data;
  
        // Lọc danh mục không trùng lặp, bỏ qua giá trị null hoặc undefined
        this.categories = [...new Set(products.map(p => p.CateName).filter(name => name))]; 
  
        // Lọc thương hiệu không trùng lặp, bỏ qua giá trị null hoặc undefined
        this.brands = [...new Set(products.map(p => p.ProductBrand).filter(brand => brand))];
  
        console.log("✅ Danh sách nhóm sản phẩm:", this.categories);
        console.log("✅ Danh sách thương hiệu:", this.brands);
      },
      error: (err) => {
        console.error("❌ Lỗi khi lấy dữ liệu sản phẩm:", err);
      }
    });
  }
  
  

  resetFilters(): void {
    this.selectedFilterType = '';  // Xóa lựa chọn bộ lọc
    this.selectedFilterValue = ''; // Xóa giá trị lọc
    this.displayedProducts = [...this.allProducts]; // Hiển thị lại toàn bộ sản phẩm
  }
  

  applyFilters(): void {
    if (!this.selectedFilterValue) {
      this.displayedProducts = [...this.allProducts];
    } else {
      this.displayedProducts = this.allProducts.filter(product => 
        product[this.selectedFilterType] === this.selectedFilterValue
      );
    }
  }

   // 🔹 Reset bộ lọc về mặc định
   resetFilter(): void {
    this.selectedFilterValue = '';
    this.displayedProducts = [...this.allProducts];
  }


  loadInventoryData(): void {
    this.inventoryService.getStockData().subscribe({
      next: (stockData) => {
        console.log('Dữ liệu tồn kho:', stockData);

        this.allProducts = stockData.map(stock => ({
          _id: stock._id,  // Lấy ID từ MongoDB
          ProductID: stock.ProductID,
          StockQuantity: stock.StockQuantity,
          ProductName: stock.ProductName || 'Không xác định',
          ProductSKU: stock.ProductSKU || 'N/A',
          CateName: stock.CateName || 'Chưa có nhóm',  // ✅ Bổ sung nhóm sản phẩm
          ProductBrand: stock.ProductBrand || 'Không xác định'  // ✅ Bổ sung thương hiệu
        }));


        this.updateTableRows();
        this.updateFilterOptions(); 
      },
      error: (err) => {
        console.error('❌ Lỗi khi lấy dữ liệu tồn kho:', err);
      }
    });
  }

  // 🔹 Cập nhật danh sách các tùy chọn lọc dựa trên loại đã chọn
  updateFilterOptions(): void {
    if (this.selectedFilterType === 'CateName') {
      this.filterOptions = this.categories;
    } else if (this.selectedFilterType === 'ProductBrand') {
      this.filterOptions = this.brands;
    }
  
    console.log("📢 Danh sách tùy chọn bộ lọc:", this.filterOptions); // 🆕 Kiểm tra dữ liệu
  }
  

  exportToCSV(): void {
    if (this.allProducts.length === 0) {
        alert("❌ Không có dữ liệu để xuất!");
        return;
    }

    const csvHeader = ['ProductID', 'ProductName', 'ProductSKU', 'CateName', 'ProductBrand', 'StockQuantity'];
    const csvRows = this.allProducts.map(product =>
        [
            product.ProductID,
            product.ProductName,
            product.ProductSKU,
            product.CateName || 'Chưa có nhóm',
            product.ProductBrand || 'Không xác định',
            product.StockQuantity
        ].map(value => `"${value}"`).join(',')
    );

    const csvContent = "\uFEFF" + [csvHeader.join(','), ...csvRows].join('\n'); // ✅ Thêm BOM để fix lỗi font
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'inventory_data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

  // ✅ Thêm chức năng tìm kiếm theo tên sản phẩm
  applySearch(): void {
    if (!this.searchQuery) {
      this.displayedProducts = [...this.allProducts]; // Nếu không nhập gì, hiển thị tất cả sản phẩm
    } else {
      const query = this.searchQuery.toLowerCase();
      this.displayedProducts = this.allProducts.filter(product =>
        product.ProductName.toLowerCase().includes(query)
      );
    }
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

  saveQuantity(index: number): void {
    const product = this.displayedProducts[index];

    console.log(`🔍 Đang cập nhật tồn kho cho sản phẩm:`, product);

    // Dùng _id thay vì ProductID
    this.inventoryService.updateStockQuantity(product._id, product.StockQuantity)
      .subscribe({
        next: (response) => {
          console.log(`✅ Cập nhật thành công cho sản phẩm ${product.ProductName}`, response);
          alert(`✅ Số lượng tồn kho của ${product.ProductName} đã được cập nhật!`);
        },
        error: (err) => {
          console.error(`❌ Lỗi khi cập nhật tồn kho cho sản phẩm ${product.ProductName}`, err);
          alert(`❌ Không thể cập nhật tồn kho. Kiểm tra lại API hoặc dữ liệu đầu vào.`);
        }
      });
  }


}



