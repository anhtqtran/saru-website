

import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

interface ProductData {
  _id?: string;
  ProductID?: string;
  name: string;
  brand: string;
  category: string;
  shortDescription: string;
  detailedDescription: string;
  wineType: string;
  price: number | string;
  comparePrice: number | string;
  volume: string;
  sku: string;
  promo: boolean;
  outOfStock: boolean;
  images: string[];
  stockQuantity: number;
}

@Component({
  selector: 'app-editproduct',
  standalone: false,
  templateUrl: './editproduct.component.html',
  styleUrls: ['./editproduct.component.css']
})
export class EditproductComponent implements AfterViewInit {
  @ViewChild('togglePromo', { static: false }) togglePromo!: ElementRef<HTMLInputElement>;
  @ViewChild('toggleText', { static: false }) toggleText!: ElementRef<HTMLElement>;
  @ViewChild('toggleOutOfStock', { static: false }) toggleOutOfStock!: ElementRef<HTMLInputElement>;
  @ViewChild('toggleText2', { static: false }) toggleText2!: ElementRef<HTMLElement>;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  productId: string = '';
  isNew: boolean = false;
  productData: ProductData = {
    name: "",
    brand: "",
    category: "Rượu Tây Bắc",
    shortDescription: "",
    detailedDescription: "",
    wineType: "",
    price: "",
    comparePrice: "",
    volume: "",
    sku: "",
    promo: false,
    outOfStock: false,
    images: [],
    stockQuantity: 0,
  };

  imagePreviews: string[] = [];
  isSaving: boolean = false;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  // ngAfterViewInit() {
  //   this.setupToggle(this.togglePromo, this.toggleText, "promo");
  //   this.setupToggle(this.toggleOutOfStock, this.toggleText2, "outOfStock");
  // }
  ngAfterViewInit() {}
  
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.isNew = params.get('isNew') === 'true';
      this.productId = params.get('id') || '';

      console.log("isNew:", this.isNew, "productId:", this.productId); // Log để kiểm tra

      if (!this.isNew && this.productId) {
        this.loadProductData();
      } else {
        this.resetForm();
      }
    });
  }

  updateToggleText(field: 'promo' | 'outOfStock'): void {
    
  }

 

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagePreviews = [];
      this.productData.images = [];

      Array.from(input.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
          this.productData.images.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.productData.images.splice(index, 1);
  }

  resetForm(): void {
    this.productData = {
      name: "",
      brand: "",
      category: "Rượu Tây Bắc",
      shortDescription: "",
      detailedDescription: "",
      wineType: "",
      price: "",
      comparePrice: "",
      volume: "",
      sku: "",
      promo: false,
      outOfStock: false,
      images: [],
      stockQuantity: 0,
    };
    this.imagePreviews = [];

   
  }

  

  loadProductData(): void {
    this.http.get<any>(`http://localhost:4000/api/products/${this.productId}`).subscribe(
      (product) => {
        if (product && product._id) {
          this.productData = {
            _id: product._id,
            ProductID: product.ProductID || "",
            name: product.ProductName || "",
            brand: product.ProductBrand || "",
            category: product.CateID || "Rượu Tây Bắc",
            shortDescription: product.ProductShortDescription || "",
            detailedDescription: product.ProductFullDescription || "",
            wineType: product.WineType || "",
            price: product.ProductPrice || "",
            comparePrice: product.ComparePrice || "",
            volume: product.WineVolume || "",
            sku: product.ProductSKU || "",
            promo: product.IsPromotion || false,
            outOfStock: product.AllowOutOfStock || false,
            stockQuantity: product.StockQuantity || 0,
            images: [
              product.ProductImageCover,
              product.ProductImageSub1,
              product.ProductImageSub2,
              product.ProductImageSub3
            ].filter(img => img)
          };
          this.imagePreviews = [...this.productData.images];
          console.log("Loaded product _id:", this.productData._id);
        } else {
          console.error("Không tìm thấy sản phẩm với _id:", this.productId);
          this.resetForm();
        }
      },
      (error) => {
        console.error("❌ Lỗi khi tải dữ liệu sản phẩm:", error);
        alert("Lỗi khi tải dữ liệu sản phẩm, vui lòng thử lại!");
        this.router.navigate(['/products']);
      }
    );
  }

  

  saveProduct(): void {
    this.isSaving = true;

    const formattedPrice = parseFloat(this.productData.price.toString().replace(/,/g, "")) || 0;
    const formattedComparePrice = parseFloat(this.productData.comparePrice.toString().replace(/,/g, "")) || 0;

    const categoryMapping: { [key: string]: string } = {
      "Rượu Tây Bắc": "CATE1",
      "Đồ ngâm rượu": "CATE2",
      "Phụ kiện": "CATE3",
      "Set quà rượu": "CATE4"
    };

    const cateID = categoryMapping[this.productData.category] || "";
    const imageID = this.productData._id ? this.productData._id : `image_${Date.now()}`;

    const updatedProduct = {
      _id: this.productData._id,
      ProductID: this.productData.ProductID || `prod_${Date.now()}`,
      ImageID: imageID,
      CateID: cateID,
      ProductName: this.productData.name.trim() || "",
      ProductPrice: formattedPrice,
      ProductBrand: this.productData.brand.trim() || "",
      ProductShortDescription: this.productData.shortDescription.trim() || "",
      ProductFullDescription: this.productData.detailedDescription.trim() || "",
      ProductSKU: this.productData.sku.trim() || "",
      StockQuantity: this.productData.stockQuantity,
      IsPromotion: this.productData.promo,
      AllowOutOfStock: this.productData.outOfStock,
      WineType: this.productData.wineType.trim() || "",
      WineVolume: this.productData.volume.trim() || "",
      ComparePrice: formattedComparePrice,
      ProductImages: this.productData.images
    };

    if (this.isNew || !this.productData._id) {
      console.log("Thêm mới sản phẩm...");
      delete updatedProduct._id;
      this.http.post('http://localhost:4000/api/products', updatedProduct).subscribe(
        (response: any) => {
          console.log("✅ Thêm sản phẩm thành công:", response);
          alert("Sản phẩm đã được thêm thành công!");
          this.router.navigate(['/products']);
        },
        (error) => {
          console.error("❌ Lỗi khi thêm sản phẩm:", error);
          alert("Lỗi khi thêm sản phẩm!");
        }
      ).add(() => {
        this.isSaving = false;
      });
    } else {
      console.log("Cập nhật sản phẩm với _id:", this.productData._id);
      this.http.put(`http://localhost:4000/api/products/${this.productData._id}`, updatedProduct).subscribe(
        (response: any) => {
          console.log("✅ Cập nhật sản phẩm thành công:", response);
          alert("Sản phẩm đã được cập nhật thành công!");
          this.router.navigate(['/products']);
        },
        (error) => {
          console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
          alert("Lỗi khi cập nhật sản phẩm!");
        }
      ).add(() => {
        this.isSaving = false;
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}