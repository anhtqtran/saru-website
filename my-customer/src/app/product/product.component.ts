import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Subscription } from 'rxjs';
import { Product, Pagination } from '../classes/Product';

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
    onSale: false
  };

  constructor(private productService: ProductService) {}
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadFilterData();
    this.loadCategories()
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
    const sub = this.productService.getImage(product.ImageID).subscribe({
      next: (imageData) => {
        product.ProductImageCover = imageData.ProductImageCover || 'https://via.placeholder.com/300';
      },
      error: () => {
        product.ProductImageCover = 'https://via.placeholder.com/300';
      }
    });
    this.subscriptions.push(sub);

  }




  loadFilterData(): void {
    this.productService.getProducts({}, 1, 1000).subscribe({
      next: (response) => {
        const uniqueCategories = new Set<string>();
        const uniqueBrands = new Set<string>();
        const uniqueWineVolumes = new Set<string>();
        const uniqueWineTypes = new Set<string>();

        response['product'].forEach((product: { CateID: string; ProductBrand: string; WineVolume: string; WineType: string; }) => {
          if (product.CateID) uniqueCategories.add(product.CateID);
          if (product.ProductBrand) uniqueBrands.add(product.ProductBrand);
          if (product.WineVolume) uniqueWineVolumes.add(product.WineVolume);
          if (product.WineType) uniqueWineTypes.add(product.WineType);
        });

        this.categories = Array.from(uniqueCategories).map(cateID => ({ CateID: cateID, CateName: cateID }));
        this.brands = Array.from(uniqueBrands);
        this.wineVolumes = Array.from(uniqueWineVolumes);
        this.wineTypes = Array.from(uniqueWineTypes);
      },
      error: (error) => console.error('Error loading filter data:', error.message)
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

  addToCart(product: Product): void {
    this.productService.addToCart(product._id, 1).subscribe({
      next: () => alert('Added to cart successfully!'),
      error: (error) => console.error('Error adding to cart:', error.message)
    });
  }

  addToCompare(product: Product): void {
    this.productService.addToCompare(product._id).subscribe({
      next: () => alert('Added to compare list successfully!'),
      error: (error) => console.error('Error adding to compare:', error.message)
    });
  }

  getPageNumbers(): number[] {
    const pageNumbers: number[] = [];
    for (let i = Math.max(1, this.pagination.currentPage - 2); 
         i <= Math.min(this.pagination.totalPages, this.pagination.currentPage + 2); i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }
  
}