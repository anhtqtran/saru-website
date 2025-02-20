import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})

export class ProductComponent implements OnInit {
    products: any[] = [];  // Mảng sản phẩm
    filteredProducts: any[] = [];  // Mảng sản phẩm đã lọc
  
    // Các filter
    searchKeyword: string = '';
    nameFilter: string = '';
    brandFilter: string = '';
    minPrice: number = 0;
    maxPrice: number = Infinity;
    priceFilter: boolean = false;
  
    constructor() { }
  
    ngOnInit(): void {
      this.loadProducts();
    }
  
    loadProducts() {
      // Bạn có thể thay thế bằng API hoặc dữ liệu từ tệp JSON
      this.products = [
        // Một số dữ liệu sản phẩm mẫu
        {
          id: 1,
          name: 'Rượu Tây Bắc',
          brand: 'Brand A',
          price: 200000,
          link: 'assets/img/ruou1.jpg',
          status: 'Còn hàng',
          oldprice: 250000
        },
        // Thêm sản phẩm khác ở đây
      ];
  
      this.displayProducts(this.products);
    }
  
    displayProducts(productList: any[]) {
      this.filteredProducts = productList.filter(product => {
        let isValid = true;
  
        if (this.searchKeyword && !product.name.toLowerCase().includes(this.searchKeyword.toLowerCase())) {
          isValid = false;
        }
  
        if (this.nameFilter && !product.name.toLowerCase().includes(this.nameFilter.toLowerCase())) {
          isValid = false;
        }
  
        if (this.brandFilter && !product.brand.toLowerCase().includes(this.brandFilter.toLowerCase())) {
          isValid = false;
        }
  
        if (this.priceFilter) {
          const price = parseFloat(product.price.toString());
          if (price < this.minPrice || price > this.maxPrice) {
            isValid = false;
          }
        }
  
        return isValid;
      });
    }
  
    onSearchInput(event: any) {
      this.searchKeyword = event.target.value;
      this.displayProducts(this.products);
    }
  
    // Các phương thức lọc khác có thể được thêm vào đây
  }
