// import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { ActivatedRoute, Router } from '@angular/router';

// interface ProductData {
//   name: string;
//   brand: string;
//   category: string;
//   shortDescription: string;
//   detailedDescription: string;
//   wineType: string;
//   price: number | string; // Chỉ nhận số nhưng vẫn có thể là chuỗi khi nhập
//   comparePrice: number | string;
//   volume: string;
//   sku: string;
//   promo: boolean;
//   outOfStock: boolean;
//   images: string[];
// }

// @Component({
//   selector: 'app-editproduct',
//   standalone: false,
//   templateUrl: './editproduct.component.html',
//   styleUrls: ['./editproduct.component.css']
// })
// export class EditproductComponent implements AfterViewInit {

//   @ViewChild('togglePromo', { static: false }) togglePromo!: ElementRef<HTMLInputElement>;
//   @ViewChild('toggleText', { static: false }) toggleText!: ElementRef<HTMLElement>;
//   @ViewChild('toggleOutOfStock', { static: false }) toggleOutOfStock!: ElementRef<HTMLInputElement>;
//   @ViewChild('toggleText2', { static: false }) toggleText2!: ElementRef<HTMLElement>;
//   @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
 

//   productId: string = '';
//   isNew: boolean = false;
//   productData: any = {
//     name: "",
//     brand: "",
//     category: "Rượu Tây Bắc",
//     shortDescription: "",
//     detailedDescription: "",
//     wineType: "",
//     price: "",
//     comparePrice: "",
//     volume: "",
//     sku: "",
//     promo: false,
//     outOfStock: false,
//     images: [],
//     stockQuantity: 0, 
//   };

//   imagePreviews: string[] = []; // Lưu danh sách ảnh xem trước
//   isSaving: boolean = false; // Trạng thái đang lưu

//   constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }
//   ngAfterViewInit() {
//     this.setupToggle(this.togglePromo, this.toggleText, "promo");
//     this.setupToggle(this.toggleOutOfStock, this.toggleText2, "outOfStock");
//   }
  

//     ngOnInit(): void {
//       this.route.queryParamMap.subscribe(params => {
//         this.isNew = params.get('isNew') === 'true';
//         this.productId = params.get('id') || '';
  
//         if (!this.isNew && this.productId) {
//           this.loadProductData(); 
//         }
//       });
//     }



//   private setupToggle<T extends "promo" | "outOfStock">(
//     toggleElement: ElementRef<HTMLInputElement>,
//     textElement: ElementRef<HTMLElement>,
//     field: T
//   ) {
//     if (toggleElement && textElement) {
//       toggleElement.nativeElement.addEventListener("change", () => {
//         const isChecked = toggleElement.nativeElement.checked;
//         this.productData[field] = isChecked;
//         textElement.nativeElement.innerText = isChecked ? "Có" : "Không";
//         textElement.nativeElement.style.color = isChecked ? "#ffb400" : "#999";
//       });

//       const isChecked = Boolean(this.productData[field]);
//       toggleElement.nativeElement.checked = isChecked;
//       textElement.nativeElement.innerText = isChecked ? "Có" : "Không";
//       textElement.nativeElement.style.color = isChecked ? "#ffb400" : "#999";
//     }
//   }

//   onFileSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.imagePreviews = []; // Xóa danh sách ảnh cũ
//       this.productData.images = []; // Xóa danh sách Base64 cũ
  
//       Array.from(input.files).forEach((file, index) => {
//         const reader = new FileReader();
//         reader.onload = (e: any) => {
//           this.imagePreviews.push(e.target.result);
//           this.productData.images.push(e.target.result); // Lưu Base64
//         };
//         reader.readAsDataURL(file);
//       });
//     }
//   }
  

//   triggerFileInput(): void {
//     this.fileInput.nativeElement.click();
//   }

//   removeImage(index: number): void {
//     this.imagePreviews.splice(index, 1);
//   }

//   resetForm(): void {
//     this.productData = {
//       name: "",
//       brand: "",
//       category: "Rượu Tây Bắc",
//       shortDescription: "",
//       detailedDescription: "",
//       wineType: "",
//       price: "",
//       comparePrice: "",
//       volume: "",
//       sku: "",
//       promo: false,
//       outOfStock: false,
//       images: [],
//       stockQuantity: 0,
//     };

//     this.imagePreviews = [];

//     (document.getElementById("product-name") as HTMLInputElement).value = "";
//     (document.getElementById("brand") as HTMLInputElement).value = "";
//     (document.getElementById("short-description") as HTMLInputElement).value = "";
//     (document.getElementById("detailed-description") as HTMLInputElement).value = "";
//     (document.getElementById("wine-type") as HTMLInputElement).value = "";
//     (document.getElementById("price") as HTMLInputElement).value = "";
//     (document.getElementById("compare-price") as HTMLInputElement).value = "";
//     (document.getElementById("volume") as HTMLInputElement).value = "";
//     (document.getElementById("sku") as HTMLInputElement).value = "";

//     (document.getElementById("category") as HTMLSelectElement).value = "Rượu Tây Bắc";

//     this.togglePromo.nativeElement.checked = false;
//     this.toggleText.nativeElement.innerText = "Không";
//     this.toggleText.nativeElement.style.color = "#999";

//     this.toggleOutOfStock.nativeElement.checked = false;
//     this.toggleText2.nativeElement.innerText = "Không";
//     this.toggleText2.nativeElement.style.color = "#999";
//   }



//   loadProductData(): void {
//     this.http.get<any>(`http://localhost:4000/api/products/${this.productId}`).subscribe(
//       (product) => {
//         this.productData = {
//           name: product.ProductName || "",
//           brand: product.ProductBrand || "",
//           category: product.CateID || "Rượu Tây Bắc",
//           shortDescription: product.ShortDescription || "",
//           detailedDescription: product.ProductFullDescription || "",
//           wineType: product.WineType || "",
//           price: product.ProductPrice || "",
//           comparePrice: product.ComparePrice || "",
//           volume: product.WineVolume || "",
//           sku: product.ProductSKU || "",
//           promo: product.IsPromotion || false,
//           outOfStock: product.AllowOutOfStock || false,
//           stockQuantity: product.StockQuantity || 0,
//           images: [
//             product.ProductImageCover,
//             product.ProductImageSub1,
//             product.ProductImageSub2,
//             product.ProductImageSub3
//           ].filter(img => img) // Chỉ lấy ảnh không null
//         };
  
//         this.imagePreviews = this.productData.images;
//       },
//       (error) => {
//         console.error("❌ Lỗi khi tải dữ liệu sản phẩm:", error);
//       }
//     );
//   }
  



//   saveProduct(): void {
//     this.isSaving = true;

//     const priceInput = (document.getElementById("price") as HTMLInputElement).value.trim();
//     const formattedPrice = parseFloat(priceInput.replace(/,/g, "")) || 0;
//     const categoryValue = (document.getElementById("category") as HTMLSelectElement).value;

//     // Ánh xạ danh mục
//     const categoryMapping: { [key: string]: string } = {
//       "Rượu Tây Bắc": "CATE1",
//       "Đồ ngâm rượu": "CATE2",
//       "Phụ kiện": "CATE3",
//       "Set quà rượu": "CATE4"
//     };

//     const cateID = categoryMapping[categoryValue] || "";
//     const imageID = `image_${Date.now()}`;

//     const updatedProduct = {
//       ProductID: `prod_${Date.now()}`,
//       ImageID: imageID,
//       CateID: cateID,
//       ProductName: (document.getElementById("product-name") as HTMLInputElement).value.trim() || "",
//       ProductPrice: formattedPrice,
//       ProductBrand: (document.getElementById("brand") as HTMLInputElement).value.trim() || "",
//       ProductFullDescription: (document.getElementById("detailed-description") as HTMLTextAreaElement).value.trim() || "",
//       ProductShortDescription: (document.getElementById("short-description") as HTMLInputElement).value.trim() || "",
//       ProductSKU: (document.getElementById("sku") as HTMLInputElement).value.trim() || "",
//       StockQuantity: this.productData.stockQuantity, // ✅ Gửi số lượng tồn kho
//       CreatedAt: new Date(),
//       ProductImages: this.productData.images // ✅ Gửi danh sách ảnh Base64
//     };

//     this.http.post(`http://localhost:4000/api/products`, updatedProduct).subscribe(
//       (response: any) => {
//         console.log("✅ Thêm sản phẩm thành công:", response);
//         alert("Sản phẩm đã được thêm thành công!");
//         this.router.navigate(['/products']);
//       },
//       (error) => {
//         console.error("❌ Lỗi khi thêm sản phẩm:", error);
//         alert("Lỗi khi thêm sản phẩm!");
//       }
//     ).add(() => {
//       this.isSaving = false;
//     });
// }




// //quay về trang productlist khi ấn nút quay lại
// goBack(): void {
//   this.router.navigate(['/products']);
// }

// }

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
    // Không cần DOM manipulation nữa vì đã dùng ngModel
  }

  // private setupToggle<T extends "promo" | "outOfStock">(
  //   toggleElement: ElementRef<HTMLInputElement>,
  //   textElement: ElementRef<HTMLElement>,
  //   field: T
  // ) {
  //   if (toggleElement && textElement) {
  //     toggleElement.nativeElement.addEventListener("change", () => {
  //       const isChecked = toggleElement.nativeElement.checked;
  //       this.productData[field] = isChecked;
  //       textElement.nativeElement.innerText = isChecked ? "Có" : "Không";
  //       textElement.nativeElement.style.color = isChecked ? "#ffb400" : "#999";
  //     });

  //     const isChecked = Boolean(this.productData[field]);
  //     toggleElement.nativeElement.checked = isChecked;
  //     textElement.nativeElement.innerText = isChecked ? "Có" : "Không";
  //     textElement.nativeElement.style.color = isChecked ? "#ffb400" : "#999";
  //   }
  // }

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

    // (document.getElementById("product-name") as HTMLInputElement).value = "";
    // (document.getElementById("brand") as HTMLInputElement).value = "";
    // (document.getElementById("short-description") as HTMLInputElement).value = "";
    // (document.getElementById("detailed-description") as HTMLTextAreaElement).value = "";
    // (document.getElementById("wine-type") as HTMLInputElement).value = "";
    // (document.getElementById("price") as HTMLInputElement).value = "";
    // (document.getElementById("compare-price") as HTMLInputElement).value = "";
    // (document.getElementById("volume") as HTMLInputElement).value = "";
    // (document.getElementById("sku") as HTMLInputElement).value = "";
    // (document.getElementById("category") as HTMLSelectElement).value = "Rượu Tây Bắc";
    // (document.getElementById("quantity") as HTMLInputElement).value = "0";

    // this.togglePromo.nativeElement.checked = false;
    // this.toggleText.nativeElement.innerText = "Không";
    // this.toggleText.nativeElement.style.color = "#999";

    // this.toggleOutOfStock.nativeElement.checked = false;
    // this.toggleText2.nativeElement.innerText = "Không";
    // this.toggleText2.nativeElement.style.color = "#999";
  }

  // loadProductData(): void {
  //   this.http.get<any>(`http://localhost:4000/api/products/${this.productId}`).subscribe(
  //     (product) => {
  //       if (product && product._id) {
  //         this.productData = {
  //           _id: product._id,
  //           ProductID: product.ProductID || "",
  //           name: product.ProductName || "",
  //           brand: product.ProductBrand || "",
  //           category: product.CateID || "Rượu Tây Bắc",
  //           shortDescription: product.ProductShortDescription || "",
  //           detailedDescription: product.ProductFullDescription || "",
  //           wineType: product.WineType || "",
  //           price: product.ProductPrice || "",
  //           comparePrice: product.ComparePrice || "",
  //           volume: product.WineVolume || "",
  //           sku: product.ProductSKU || "",
  //           promo: product.IsPromotion || false,
  //           outOfStock: product.AllowOutOfStock || false,
  //           stockQuantity: product.StockQuantity || 0,
  //           images: [
  //             product.ProductImageCover,
  //             product.ProductImageSub1,
  //             product.ProductImageSub2,
  //             product.ProductImageSub3
  //           ].filter(img => img)
  //         };

  //         console.log("Loaded product _id:", this.productData._id); // Log để kiểm tra _id

  //         this.imagePreviews = [...this.productData.images];

  //         // Cập nhật giao diện form với dữ liệu sản phẩm
  //         (document.getElementById("product-name") as HTMLInputElement).value = this.productData.name;
  //         (document.getElementById("brand") as HTMLInputElement).value = this.productData.brand;
  //         (document.getElementById("short-description") as HTMLInputElement).value = this.productData.shortDescription;
  //         (document.getElementById("detailed-description") as HTMLTextAreaElement).value = this.productData.detailedDescription;
  //         (document.getElementById("wine-type") as HTMLInputElement).value = this.productData.wineType;
  //         (document.getElementById("price") as HTMLInputElement).value = this.productData.price.toString();
  //         (document.getElementById("compare-price") as HTMLInputElement).value = this.productData.comparePrice.toString();
  //         (document.getElementById("volume") as HTMLInputElement).value = this.productData.volume;
  //         (document.getElementById("sku") as HTMLInputElement).value = this.productData.sku;
  //         (document.getElementById("category") as HTMLSelectElement).value = this.productData.category;
  //         (document.getElementById("quantity") as HTMLInputElement).value = this.productData.stockQuantity.toString();

  //         this.togglePromo.nativeElement.checked = this.productData.promo;
  //         this.toggleText.nativeElement.innerText = this.productData.promo ? "Có" : "Không";
  //         this.toggleText.nativeElement.style.color = this.productData.promo ? "#ffb400" : "#999";

  //         this.toggleOutOfStock.nativeElement.checked = this.productData.outOfStock;
  //         this.toggleText2.nativeElement.innerText = this.productData.outOfStock ? "Có" : "Không";
  //         this.toggleText2.nativeElement.style.color = this.productData.outOfStock ? "#ffb400" : "#999";
  //       } else {
  //         console.error("Không tìm thấy sản phẩm với _id:", this.productId);
  //         this.resetForm();
  //       }
  //     },
  //     (error) => {
  //       console.error("❌ Lỗi khi tải dữ liệu sản phẩm:", error);
  //       alert("Lỗi khi tải dữ liệu sản phẩm, vui lòng thử lại!");
  //       this.router.navigate(['/products']);
  //     }
  //   );
  // }

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

  // saveProduct(): void {
  //   this.isSaving = true;

  //   console.log("Saving product with _id:", this.productData._id, "isNew:", this.isNew); // Log để kiểm tra

  //   const priceInput = (document.getElementById("price") as HTMLInputElement).value.trim();
  //   const formattedPrice = parseFloat(priceInput.replace(/,/g, "")) || 0;
  //   const comparePriceInput = (document.getElementById("compare-price") as HTMLInputElement).value.trim();
  //   const formattedComparePrice = parseFloat(comparePriceInput.replace(/,/g, "")) || 0;
  //   const categoryValue = (document.getElementById("category") as HTMLSelectElement).value;
  //   const stockQuantity = parseInt((document.getElementById("quantity") as HTMLInputElement).value) || 0;

  //   const categoryMapping: { [key: string]: string } = {
  //     "Rượu Tây Bắc": "CATE1",
  //     "Đồ ngâm rượu": "CATE2",
  //     "Phụ kiện": "CATE3",
  //     "Set quà rượu": "CATE4"
  //   };

  //   const cateID = categoryMapping[categoryValue] || "";
  //   const imageID = this.productData._id ? this.productData._id : `image_${Date.now()}`;

  //   const updatedProduct = {
  //     _id: this.productData._id,
  //     ProductID: this.productData.ProductID || `prod_${Date.now()}`,
  //     ImageID: imageID,
  //     CateID: cateID,
  //     ProductName: (document.getElementById("product-name") as HTMLInputElement).value.trim() || "",
  //     ProductPrice: formattedPrice,
  //     ProductBrand: (document.getElementById("brand") as HTMLInputElement).value.trim() || "",
  //     ProductShortDescription: (document.getElementById("short-description") as HTMLInputElement).value.trim() || "",
  //     ProductFullDescription: (document.getElementById("detailed-description") as HTMLTextAreaElement).value.trim() || "",
  //     ProductSKU: (document.getElementById("sku") as HTMLInputElement).value.trim() || "",
  //     StockQuantity: stockQuantity,
  //     IsPromotion: this.productData.promo,
  //     AllowOutOfStock: this.productData.outOfStock,
  //     WineType: (document.getElementById("wine-type") as HTMLInputElement).value.trim() || "",
  //     WineVolume: (document.getElementById("volume") as HTMLInputElement).value.trim() || "",
  //     ComparePrice: formattedComparePrice,
  //     ProductImages: this.productData.images
  //   };

  //   if (this.isNew || !this.productData._id) {
  //     console.log("Thêm mới sản phẩm...");
  //     delete updatedProduct._id;
  //     this.http.post('http://localhost:4000/api/products', updatedProduct).subscribe(
  //       (response: any) => {
  //         console.log("✅ Thêm sản phẩm thành công:", response);
  //         alert("Sản phẩm đã được thêm thành công!");
  //         this.router.navigate(['/products']);
  //       },
  //       (error) => {
  //         console.error("❌ Lỗi khi thêm sản phẩm:", error);
  //         alert("Lỗi khi thêm sản phẩm!");
  //       }
  //     ).add(() => {
  //       this.isSaving = false;
  //     });
  //   } else {
  //     console.log("Cập nhật sản phẩm với _id:", this.productData._id);
  //     this.http.put(`http://localhost:4000/api/products/${this.productData._id}`, updatedProduct).subscribe(
  //       (response: any) => {
  //         console.log("✅ Cập nhật sản phẩm thành công:", response);
  //         alert("Sản phẩm đã được cập nhật thành công!");
  //         this.router.navigate(['/products']);
  //       },
  //       (error) => {
  //         console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
  //         alert("Lỗi khi cập nhật sản phẩm! Chi tiết:");
  //       }
  //     ).add(() => {
  //       this.isSaving = false;
  //     });
  //   }
  // }

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
    this.router.navigate(['admin/products']);
  }
}