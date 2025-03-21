import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../classes/Product';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HomepageProductsService } from '../services/homepage-products.service'; // Hỗ trợ best-seller
import { BestSellingProduct } from '../classes/BestSellingProduct'; // Class cho best-seller
import { Lightbox } from 'ngx-lightbox'; // Tính năng lightbox

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  selectedImage: string | undefined;
  activeTab: string = 'description';
  isLoading: boolean = true;

  constructor(
    private productService: ProductService,
    private bestSellerIdService: HomepageProductsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private lightbox: Lightbox
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.bestSellerIdService.getBestSellerIds().subscribe({
          next: (bestSellerIds) => {
            if (bestSellerIds.includes(productId)) {
              this.loadBestSellerDetail(productId);
            } else {
              this.bestSellerIdService.getObjectIdFromProductId(productId).subscribe({
                next: (_id) => {
                  console.log('Mapped _id:', _id);
                  this.loadProductDetail(_id);
                },
                error: (error) => {
                  console.error('Error mapping productId to _id:', error.message);
                  this.snackBar.open('Không thể ánh xạ ID sản phẩm.', 'OK', { duration: 3000 });
                  this.isLoading = false;
                }
              });
            }
          },
          error: (error) => {
            console.error('Error fetching best seller IDs:', error.message);
            this.bestSellerIdService.getObjectIdFromProductId(productId).subscribe({
              next: (_id) => {
                console.log('Mapped _id:', _id);
                this.loadProductDetail(_id);
              },
              error: (error) => {
                console.error('Error mapping productId to _id:', error.message);
                this.snackBar.open('Không thể ánh xạ ID sản phẩm.', 'OK', { duration: 3000 });
                this.isLoading = false;
              }
            });
          }
        });
      } else {
        this.snackBar.open('Không tìm thấy ID sản phẩm', 'OK', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadBestSellerDetail(productId: string): void {
    this.isLoading = true;
    this.bestSellerIdService.getBestSellerDetail(productId).subscribe({
      next: (data: BestSellingProduct) => {
        if (!data.reviews) data.reviews = [];
        this.product = {
          _id: data._id,
          ProductID: data.productId,
          ProductName: data.productName,
          ProductPrice: data.productPrice,
          ProductImageCover: data.productImageCover,
          CateName: data.categoryName,
          reviewCount: data.reviewCount,
          averageRating: data.averageRating,
          reviews: data.reviews,
          relatedProducts: data.relatedProducts,
          CateID: data.CateID,
          ProductNetContent: data.productNetContent,
          ProductBrand: data.ProductBrand || '',
          ProductFullDescription: data.ProductFullDescription || '',
          ProductShortDescription: data.ProductShortDescription || '',
          ProductSKU: data.ProductSKU || '',
          ImageID: data.ImageID || '',
          currentPrice: data.productPrice,
          originalPrice: data.productPrice,
          discountPercentage: 0,
          stockStatus: 'In Stock',
          isOnSale: false,
          totalReviewCount: data.reviewCount || 0
        };
        this.selectedImage = this.product.ProductImageCover || 'assets/images/default-product.png';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading best seller detail:', error.message);
        this.snackBar.open('Không thể tải chi tiết sản phẩm best seller.', 'OK', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  async loadProductDetail(id: string): Promise<void> {
    this.isLoading = true;
    try {
      const data = await this.productService.getProductDetail(id).toPromise();
      if (!data) {
        console.error('Product data is null');
        this.snackBar.open('Không thể tải chi tiết sản phẩm.', 'OK', { duration: 3000 });
        this.isLoading = false;
        return;
      }

      console.log('Related products data:', data.relatedProducts);
      if (!data.reviews) data.reviews = [];

      const enrichedProduct = await this.enrichProductData(data);
      this.product = {
        ...enrichedProduct,
        currentPrice: enrichedProduct.currentPrice ?? enrichedProduct.ProductPrice ?? 0,
        originalPrice: enrichedProduct.originalPrice ?? enrichedProduct.ProductPrice ?? 0,
        stockStatus: enrichedProduct.stockStatus ?? 'In Stock',
        isOnSale: !!enrichedProduct.isOnSale,
        discountPercentage: enrichedProduct.discountPercentage ?? 0,
        averageRating: enrichedProduct.averageRating ?? 0,
        totalReviewCount: enrichedProduct.totalReviewCount ?? 0
      };
      this.selectedImage = this.product.ProductImageCover || 'assets/images/default-product.png';
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading product detail:', error);
      this.snackBar.open('Không thể tải chi tiết sản phẩm.', 'OK', { duration: 3000 });
      this.isLoading = false;
    }
  }

  private async enrichProductData(product: Product): Promise<Product> {
    if (product.relatedProducts && product.relatedProducts.length > 0) {
      const enrichedRelated = await Promise.all(
        product.relatedProducts.map(async related => {
          if (!related.ProductImageCover) {
            const imageData = await this.productService.getImageForRelatedProduct(related._id).toPromise();
            return {
              ...related,
              ProductImageCover: imageData?.ProductImageCover || 'assets/images/default-product.png'
            };
          }
          return related;
        })
      );
      return { ...product, relatedProducts: enrichedRelated };
    }
    return product;
  }

  openLightbox(image: string): void {
    this.lightbox.open([{ src: image, thumb: image }]);
  }

  selectImage(image: string): void {
    this.selectedImage = image || 'assets/images/default-product.png';
  }
  
  addToCart(product: Product): void {
    if (product) {
      this.productService.addToCart(product._id, 1).subscribe({
        next: () => this.snackBar.open('Đã thêm vào giỏ hàng!', 'OK', { duration: 3000 }),
        error: (error) => {
          console.error('Error adding to cart:', error.message);
          this.snackBar.open('Lỗi khi thêm vào giỏ hàng', 'OK', { duration: 3000 });
        }
      });
    }
  }

  addToCompare(product: Product): void {
    if (product) {
      console.log('Adding to compare, productId:', product._id);
      this.productService.addToCompare(product._id.toString()).subscribe({
        next: (response) => {
          console.log('Add to compare response:', response);
          this.snackBar.open('Đã thêm vào danh sách so sánh!', 'OK', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error adding to compare:', error);
          this.snackBar.open('Lỗi khi thêm vào danh sách so sánh', 'Close', { duration: 3000 });
        }
      });
    }
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  getStarArray(rating: number | undefined): number[] {
    const roundedRating = Math.round(rating || 0);
    return Array(roundedRating > 5 ? 5 : roundedRating).fill(0);
  }

  getEmptyStarArray(rating: number | undefined): number[] {
    const roundedRating = Math.round(rating || 0);
    return Array(5 - (roundedRating > 5 ? 5 : roundedRating)).fill(0);
  }

  goToProductDetail(event: Event, productId: string): void {
    event.stopPropagation();
    console.log('Clicked product ID:', productId);

    if (!productId) {
      console.error('Invalid productId:', productId);
      this.snackBar.open('ID sản phẩm không hợp lệ', 'OK', { duration: 3000 });
      return;
    }

    this.router.navigate(['/products', productId]).then(navigationResult => {
      console.log('Navigation success:', navigationResult);
      if (!navigationResult) {
        console.error('Navigation failed, check route config');
        this.snackBar.open('Không thể điều hướng. Kiểm tra cấu hình route.', 'OK', { duration: 3000 });
      }
    });
  }
}