<<<<<<< Updated upstream
import { Component, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
=======
// import { Component, OnInit, HostListener } from '@angular/core';
// import { ProductService } from '../services/product.service';
// import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-productlist',
//   templateUrl: './productlist.component.html',
//   styleUrls: ['./productlist.component.css'],
//   standalone: false
// })
// export class ProductlistComponent implements OnInit {
//   products: any[] = [];
//   selectAll: boolean = false;
//   itemsPerPage: number = 10;
//   displayedProducts: any[] = [];
//   currentPage: number = 1;
//   isFilterDropdownOpen: boolean = false;
//   selectedFilter: string = 'category';
//   selectedValue: string = '';
//   searchSubject = new Subject<string>();
//   searchQuery: string = '';
//   searchSuggestions: any[] = [];

//   // Các tùy chọn lọc (Ban đầu rỗng, sẽ cập nhật từ API)
//   filterOptions: any = {
//     category: ['Khác', 'Thực phẩm', 'Đồ uống'],
//     brand: [], // ⚡ Cập nhật từ API
//     price: ['Dưới 1.000.000đ', '1.000.000đ-5.000.000đ', 'Trên 5.000.000đ']
//   };

//   constructor(private productService: ProductService, private router: Router) { }

//   ngOnInit(): void {
//     this.fetchProducts();
//     this.fetchFilters(); // ⚡ Gọi API lấy danh sách nhà cung cấp
//     // ✅ Thêm debounce để giảm số lần request API khi nhập
//     this.searchSubject.pipe(
//       debounceTime(300), // Chờ 300ms sau khi gõ
//       distinctUntilChanged() // Chỉ gọi API khi chuỗi thay đổi
//     ).subscribe(query => {
//       if (query.length > 1) {
//         this.fetchSearchSuggestions(query);
//       } else {
//         this.searchSuggestions = [];
//       }
//     });
//   }


//   fetchProducts(): void {
//     this.productService.getProducts().subscribe(
//       (data) => {
//         this.products = data.map(product => ({
//           ...product,
//           ProductPrice: product.ProductPrice || 0,
//           StockQuantity: product.StockQuantity || 0 // ✅ Cập nhật số lượng tồn kho từ API
//         }));
//         console.log("✅ Dữ liệu API đã tải:", this.products);
//         this.updateDisplayedProducts();
//       },
//       (error) => {
//         console.error('❌ Lỗi khi tải sản phẩm:', error);
//       }
//     );
// }



//    // ✅ Hàm gọi API tìm kiếm gợi ý
//    fetchSearchSuggestions(query: string): void {
//     this.productService.getSearchSuggestions(query).subscribe(
//       (suggestions) => {
//         this.searchSuggestions = suggestions;
//       },
//       (error) => {
//         console.error('❌ Lỗi khi tìm kiếm gợi ý:', error);
//       }
//     );
//   }
//   // ✅ Hàm chọn sản phẩm từ gợi ý
//   // ✅ Khi nhấp vào gợi ý, cập nhật input và lọc ngay lập tức
// selectSuggestion(suggestion: string): void {
//   this.searchQuery = suggestion; // Gán tên sản phẩm vào thanh tìm kiếm
//   this.searchSuggestions = []; // Ẩn danh sách gợi ý
//   this.applySearch(); // Thực hiện tìm kiếm ngay sau khi chọn
// }

//   // ✅ Hàm tìm kiếm khi nhấn enter hoặc chọn gợi ý
//   // ✅ Cập nhật danh sách sản phẩm khi nhấn Enter
// applySearch(): void {
//   if (!this.searchQuery.trim()) {
//       this.displayedProducts = [...this.products]; // Nếu không nhập gì, hiển thị tất cả
//   } else {
//       this.displayedProducts = this.products.filter(product =>
//           product.ProductName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
//           product.ProductSKU.toLowerCase().includes(this.searchQuery.toLowerCase())
//       );
//   }

//   // ✅ Kiểm tra danh sách hiển thị sau khi lọc
//   console.log("✅ Sản phẩm sau khi lọc:", this.displayedProducts);
// }

//   // 🔥 Thêm API để lấy danh sách nhà cung cấp (ProductBrand)
//   fetchFilters(): void {
//     this.productService.getFilters().subscribe(
//       (data) => {
//         console.log("🎯 Dữ liệu bộ lọc từ API:", data);
//         this.filterOptions.brand = data.brands || []; // Cập nhật danh sách nhà cung cấp
//       },
//       (error) => {
//         console.error('❌ Lỗi khi tải danh sách bộ lọc:', error);
//       }
//     );
//   }


//   updateDisplayedProducts(fromFilter: boolean = false): void {
//     console.log(`🔹 Cập nhật danh sách hiển thị: Trang ${this.currentPage}, Hiển thị ${this.itemsPerPage}`);

//     if (!fromFilter && this.products.length === 0) {
//         console.log("🛑 Danh sách sản phẩm rỗng, gọi API để lấy dữ liệu mới...");
//         this.fetchProducts();
//         return;
//     }

//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     const endIndex = startIndex + this.itemsPerPage;

//     // ✅ Nếu gọi từ filter, dùng `displayedProducts`, nếu không thì lấy từ toàn bộ sản phẩm
//     const source = fromFilter ? this.displayedProducts : this.products;
//     this.displayedProducts = source.slice(startIndex, endIndex);

//     console.log("✅ Danh sách hiển thị sau cập nhật:", this.displayedProducts);
// }

// // ✅ Hàm để hủy bộ lọc và reset về trạng thái ban đầu
// cancelFilter(): void {
//   console.log("🔄 Hủy bộ lọc, khôi phục danh sách sản phẩm gốc.");
//   this.selectedFilter = 'category'; // Reset loại bộ lọc
//   this.selectedValue = ''; // Xóa giá trị lọc
//   this.displayedProducts = [...this.products]; // Khôi phục danh sách sản phẩm đầy đủ
//   this.currentPage = 1; // Quay lại trang đầu tiên
//   this.toggleFilterDropdown(); // Đóng dropdown bộ lọc
//   this.updateDisplayedProducts(true); // Cập nhật lại hiển thị
// }


//   onItemsPerPageChange(event: any): void {
//     this.itemsPerPage = Number(event.target.value);
//     this.currentPage = 1;
//     console.log(`🔹 Người dùng chọn hiển thị: ${this.itemsPerPage} sản phẩm`);
//     this.updateDisplayedProducts();
//   }


//   goToPage(page: number): void {
//     if (page >= 1 && page <= this.totalPages) {
//       this.currentPage = page;
//       this.updateDisplayedProducts();
//     }
//   }

//   get totalPages(): number {
//     return Math.ceil(this.products.length / this.itemsPerPage);
//   }


//   toggleSelectAll(): void {
//     this.products.forEach(product => product.selected = this.selectAll);
//   }

//   deleteProduct(productId: string): void {
//     const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?");
//     if (confirmDelete) {
//       console.log("🛑 Xóa sản phẩm với _id:", productId);
//       this.productService.deleteProduct(productId).subscribe(
//         () => {
//           console.log("✅ Xóa thành công!");
//           this.products = this.products.filter(product => product._id !== productId);
//           this.updateDisplayedProducts();
//         },
//         (error) => {
//           console.error('❌ Lỗi khi xóa sản phẩm:', error);
//         }
//       );
//     }
//   }

//   toggleFilterDropdown(): void {
//     this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
//   }

//   applyFilter(): void {
//     console.log(`🔹 Lọc sản phẩm theo ${this.selectedFilter}: ${this.selectedValue}`);

//     if (!this.selectedValue) {
//         this.displayedProducts = [...this.products]; // ✅ Hiển thị tất cả nếu không có giá trị lọc
//     } else {
//         this.displayedProducts = this.products.filter(product => {
//             if (this.selectedFilter === 'stock') {
//                 if (this.selectedValue === 'lowStock') return product.StockQuantity < 50;
//                 if (this.selectedValue === 'sufficientStock') return product.StockQuantity >= 50;
//             } else if (this.selectedFilter === 'brand') {
//                 return product.ProductBrand === this.selectedValue;
//             } else if (this.selectedFilter === 'price') {
//                 const price = product.ProductPrice;
//                 if (this.selectedValue === 'Dưới 1.000.000đ') return price < 1000000;
//                 if (this.selectedValue === '1.000.000đ-5.000.000đ') return price >= 1000000 && price <= 5000000;
//                 if (this.selectedValue === 'Trên 5.000.000đ') return price > 5000000;
//             }
//             return true;
//         });
//     }

//     console.log("✅ Danh sách sản phẩm sau khi lọc:", this.displayedProducts);

//     this.currentPage = 1; // ✅ Quay lại trang đầu tiên khi lọc
//     this.updateDisplayedProducts(true); // ✅ Cập nhật danh sách hiển thị ngay lập tức
//     this.toggleFilterDropdown(); // ✅ Đóng dropdown sau khi lọc
// }


// // ✅ Điều hướng đến trang edit-product-themmoi
// // navigateToEditProduct(): void {
// //   this.router.navigate(['/edit-product']);
// // }

// // navigateToEditProduct(productId?: string): void {
// //   if (productId) {
// //     this.router.navigate(['/edit-product'], { queryParams: { id: productId } });
// //   } else {
// //     this.router.navigate(['/edit-product'], { queryParams: { isNew: 'true' } });
// //   }
// // }

// // Chỉ cập nhật phần liên quan trong file productlist.component.ts
// navigateToEditProduct(productId?: string): void {
//   if (productId) {
//     console.log("Navigating to edit product with _id:", productId); // Log để kiểm tra
//     this.router.navigate(['/edit-product'], { queryParams: { id: productId, isNew: false } });
//   } else {
//     console.log("Navigating to add new product");
//     this.router.navigate(['/edit-product'], { queryParams: { isNew: true } });
//   }
// }

// loadProducts(): void {
//   this.productService.getProducts().subscribe(data => {
//     this.products = data;
//     console.log("Loaded products with _id:", this.products); // Log để kiểm tra _id
//   });
// }





//   // 🛑 Đóng dropdown khi click ra ngoài
//   @HostListener('document:click', ['$event'])
//   onClickOutside(event: Event): void {
//     const target = event.target as HTMLElement;
//     if (!target.closest('.filter-container') && this.isFilterDropdownOpen) {
//       this.isFilterDropdownOpen = false;
//     }
//   }
// }


//-------------------------------------//
import { Component, OnInit, HostListener } from '@angular/core';
import { ProductService } from '../services/product.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Product } from '../classes/Product';
>>>>>>> Stashed changes

@Component({
  selector: 'app-productlist',
  standalone: false,
  templateUrl: './productlist.component.html',
  styleUrls: ['./productlist.component.css']
})
<<<<<<< Updated upstream
export class ProductlistComponent implements AfterViewInit {
=======
export class ProductlistComponent implements OnInit {
  // products: any[] = [];
  products: Product[] = [];
  selectAll: boolean = false;
  itemsPerPage: number = 10;
  // displayedProducts: any[] = [];
  displayedProducts: Product[] = []
  currentPage: number = 1;
  isFilterDropdownOpen: boolean = false;
  selectedFilter: string = 'category';
  selectedValue: string = '';
  searchSubject = new Subject<string>();
  searchQuery: string = '';
  searchSuggestions: any[] = [];
>>>>>>> Stashed changes

  @ViewChild('filterToggle', { static: false }) filterToggle!: ElementRef<HTMLButtonElement>;
  @ViewChild('filterBox', { static: false }) filterBox!: ElementRef<HTMLElement>;
  @ViewChild('cancelFilter', { static: false }) cancelFilter!: ElementRef<HTMLButtonElement>;

<<<<<<< Updated upstream
  constructor(private renderer: Renderer2) {}
=======
  // Thêm biến để quản lý modal xem chi tiết
  showModal: boolean = false;
  // selectedProduct: any | null = null;
  selectedProduct: Product | null = null;

  constructor(private productService: ProductService, private router: Router) { }
>>>>>>> Stashed changes

  ngAfterViewInit() {
    if (this.filterToggle && this.filterBox) {
      // Mở dropdown khi bấm nút
      this.renderer.listen(this.filterToggle.nativeElement, 'click', () => {
        const display = this.filterBox.nativeElement.style.display;
        this.filterBox.nativeElement.style.display = display === 'block' ? 'none' : 'block';
      });
    }

    if (this.cancelFilter && this.filterBox) {
      // Đóng dropdown khi bấm Hủy
      this.renderer.listen(this.cancelFilter.nativeElement, 'click', () => {
        this.filterBox.nativeElement.style.display = 'none';
      });
    }

    // Đóng dropdown khi click bên ngoài
    this.renderer.listen(document, 'click', (event: MouseEvent) => {
      if (
        this.filterToggle &&
        this.filterBox &&
        event.target instanceof Node &&
        !this.filterToggle.nativeElement.contains(event.target) &&
        !this.filterBox.nativeElement.contains(event.target)
      ) {
        this.filterBox.nativeElement.style.display = 'none';
      }
    });
  }
<<<<<<< Updated upstream
}
=======

  // fetchProducts(): void {
  //   this.productService.getProducts().subscribe(
  //     (data) => {
  //       this.products = data.map(product => ({
  //         ...product,
  //         ProductPrice: product.ProductPrice || 0,
  //         StockQuantity: product.StockQuantity || 0 // ✅ Cập nhật số lượng tồn kho từ API
  //       }));
  //       console.log("✅ Dữ liệu API đã tải:", this.products);
  //       this.updateDisplayedProducts();
  //     },
  //     (error) => {
  //       console.error('❌ Lỗi khi tải sản phẩm:', error);
  //     }
  //   );
  // }

  fetchProducts(): void {
    this.productService.getProductsFullDetails().subscribe(
      (data) => {
        this.products = data.data.map(product => ({
          ...product,
          ProductPrice: product.ProductPrice || 0,
          StockQuantity: product.StockQuantity || 0,
          selected: false
        }));
        console.log("✅ Dữ liệu API đã tải:", this.products);
        this.updateDisplayedProducts();
      },
      (error) => {
        console.error('❌ Lỗi khi tải sản phẩm:', error);
      }
    );
  }

  // ✅ Hàm gọi API tìm kiếm gợi ý
  fetchSearchSuggestions(query: string): void {
    this.productService.getSearchSuggestions(query).subscribe(
      (suggestions) => {
        this.searchSuggestions = suggestions;
      },
      (error) => {
        console.error('❌ Lỗi khi tìm kiếm gợi ý:', error);
      }
    );
  }

  // ✅ Hàm chọn sản phẩm từ gợi ý
  // ✅ Khi nhấp vào gợi ý, cập nhật input và lọc ngay lập tức
  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion; // Gán tên sản phẩm vào thanh tìm kiếm
    this.searchSuggestions = []; // Ẩn danh sách gợi ý
    this.applySearch(); // Thực hiện tìm kiếm ngay sau khi chọn
  }

  // ✅ Hàm tìm kiếm khi nhấn enter hoặc chọn gợi ý
  // ✅ Cập nhật danh sách sản phẩm khi nhấn Enter
  applySearch(): void {
    if (!this.searchQuery.trim()) {
      this.displayedProducts = [...this.products]; // Nếu không nhập gì, hiển thị tất cả
    } else {
      this.displayedProducts = this.products.filter(product =>
        product.ProductName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.ProductSKU.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // ✅ Kiểm tra danh sách hiển thị sau khi lọc
    console.log("✅ Sản phẩm sau khi lọc:", this.displayedProducts);
    this.currentPage = 1; // Reset về trang 1 khi tìm kiếm
    this.updateDisplayedProducts(true);
  }

  // 🔥 Thêm API để lấy danh sách nhà cung cấp (ProductBrand)
  fetchFilters(): void {
    this.productService.getFilters().subscribe(
      (data) => {
        console.log("🎯 Dữ liệu bộ lọc từ API:", data);
        this.filterOptions.brand = data.brands || []; // Cập nhật danh sách nhà cung cấp
      },
      (error) => {
        console.error('❌ Lỗi khi tải danh sách bộ lọc:', error);
      }
    );
  }

  updateDisplayedProducts(fromFilter: boolean = false): void {
    console.log(`🔹 Cập nhật danh sách hiển thị: Trang ${this.currentPage}, Hiển thị ${this.itemsPerPage}`);

    if (!fromFilter && this.products.length === 0) {
      console.log("🛑 Danh sách sản phẩm rỗng, gọi API để lấy dữ liệu mới...");
      this.fetchProducts();
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // ✅ Nếu gọi từ filter, dùng `displayedProducts`, nếu không thì lấy từ toàn bộ sản phẩm
    const source = fromFilter ? this.displayedProducts : this.products;
    this.displayedProducts = source.slice(startIndex, endIndex);

    console.log("✅ Danh sách hiển thị sau cập nhật:", this.displayedProducts);
  }

  // ✅ Hàm để hủy bộ lọc và reset về trạng thái ban đầu
  cancelFilter(): void {
    console.log("🔄 Hủy bộ lọc, khôi phục danh sách sản phẩm gốc.");
    this.selectedFilter = 'category'; // Reset loại bộ lọc
    this.selectedValue = ''; // Xóa giá trị lọc
    this.displayedProducts = [...this.products]; // Khôi phục danh sách sản phẩm đầy đủ
    this.currentPage = 1; // Quay lại trang đầu tiên
    this.toggleFilterDropdown(); // Đóng dropdown bộ lọc
    this.updateDisplayedProducts(true); // Cập nhật lại hiển thị
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = Number(event.target.value);
    this.currentPage = 1;
    console.log(`🔹 Người dùng chọn hiển thị: ${this.itemsPerPage} sản phẩm`);
    this.updateDisplayedProducts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProducts();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.products.length / this.itemsPerPage);
  }

  toggleSelectAll(): void {
    this.products.forEach(product => product.selected = this.selectAll);
  }

  deleteProduct(productId: string): void {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?");
    if (confirmDelete) {
      console.log("🛑 Xóa sản phẩm với _id:", productId);
      this.productService.deleteProduct(productId).subscribe(
        () => {
          console.log("✅ Xóa thành công!");
          this.products = this.products.filter(product => product._id !== productId);
          this.updateDisplayedProducts();
        },
        (error) => {
          console.error('❌ Lỗi khi xóa sản phẩm:', error);
        }
      );
    }
  }

  toggleFilterDropdown(): void {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  applyFilter(): void {
    console.log(`🔹 Lọc sản phẩm theo ${this.selectedFilter}: ${this.selectedValue}`);

    if (!this.selectedValue) {
      this.displayedProducts = [...this.products]; // ✅ Hiển thị tất cả nếu không có giá trị lọc
    } else {
      this.displayedProducts = this.products.filter(product => {
        if (this.selectedFilter === 'stock') {
          if (this.selectedValue === 'lowStock') return product.StockQuantity < 50;
          if (this.selectedValue === 'sufficientStock') return product.StockQuantity >= 50;
        } else if (this.selectedFilter === 'brand') {
          return product.ProductBrand === this.selectedValue;
        } else if (this.selectedFilter === 'price') {
          const price = product.ProductPrice;
          if (this.selectedValue === 'Dưới 1.000.000đ') return price < 1000000;
          if (this.selectedValue === '1.000.000đ-5.000.000đ') return price >= 1000000 && price <= 5000000;
          if (this.selectedValue === 'Trên 5.000.000đ') return price > 5000000;
        }
        return true;
      });
    }

    console.log("✅ Danh sách sản phẩm sau khi lọc:", this.displayedProducts);

    this.currentPage = 1; // ✅ Quay lại trang đầu tiên khi lọc
    this.updateDisplayedProducts(true); // ✅ Cập nhật danh sách hiển thị ngay lập tức
    this.toggleFilterDropdown(); // ✅ Đóng dropdown sau khi lọc
  }

  // ✅ Điều hướng đến trang edit-product-themmoi
  navigateToEditProduct(productId?: string): void {
    if (productId) {
      console.log("Navigating to edit product with _id:", productId); // Log để kiểm tra
      this.router.navigate(['/edit-product'], { queryParams: { id: productId, isNew: false } });
    } else {
      console.log("Navigating to add new product");
      this.router.navigate(['/edit-product'], { queryParams: { isNew: true } });
    }
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      console.log("Loaded products with _id:", this.products); // Log để kiểm tra _id
    });
  }

  // 🛑 Đóng dropdown khi click ra ngoài
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-container') && this.isFilterDropdownOpen) {
      this.isFilterDropdownOpen = false;
    }
  }

  // Hàm hiển thị chi tiết sản phẩm trong modal
  viewProductDetails(productId: string): void {
    const product = this.products.find(p => p._id === productId);
    if (product) {
      this.selectedProduct = { ...product }; // Sao chép để tránh thay đổi trực tiếp dữ liệu gốc
      this.showModal = true;
    } else {
      this.productService.getProductById(productId).subscribe(
        (response) => {
          this.selectedProduct = response;
          this.showModal = true;
        },
        (error) => {
          console.error('❌ Lỗi khi lấy chi tiết sản phẩm:', error);
          alert('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau!');
        }
      );
    }
  }

  // Hàm đóng modal
  closeModal(event?: MouseEvent): void {
    if (event && event.target === event.currentTarget) {
      this.showModal = false;
      this.selectedProduct = null;
    } else if (!event) {
      this.showModal = false;
      this.selectedProduct = null;
    }
  }

  onProductSelect(product: Product): void {
    this.selectAll = this.products.every(p => p.selected);
  }
  // Hàm ánh xạ CateID thành tên nhóm sản phẩm (nếu cần)
  getCategoryName(cateID: string): string {
    const categoryMapping: { [key: string]: string } = {
      'CATE1': 'Rượu Tây Bắc',
      'CATE2': 'Đồ ngâm rượu',
      'CATE3': 'Phụ kiện',
      'CATE4': 'Set quà rượu'
    };
    return categoryMapping[cateID] || cateID;
  }
}
>>>>>>> Stashed changes
