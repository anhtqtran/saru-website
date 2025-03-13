import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

interface ProductData {
  name: string;
  brand: string;
  category: string;
  shortDescription: string;
  detailedDescription: string;
  wineType: string;
  price: number | string; // Chỉ nhận số nhưng vẫn có thể là chuỗi khi nhập
  comparePrice: number | string;
  volume: string;
  sku: string;
  promo: boolean;
  outOfStock: boolean;
  images: string[];
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
  productData: any = {
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

  imagePreviews: string[] = []; // Lưu danh sách ảnh xem trước
  isSaving: boolean = false; // Trạng thái đang lưu

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }
  ngAfterViewInit() {
    this.setupToggle(this.togglePromo, this.toggleText, "promo");
    this.setupToggle(this.toggleOutOfStock, this.toggleText2, "outOfStock");
  }
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const isNew = params.get('isNew') === 'true';
      if (isNew) {
        this.resetForm(); // Reset form để nhập sản phẩm mới
        this.productId = ''; // Xóa productId để không cập nhật nhầm sản phẩm cũ
      } else {
        this.loadProductData(); // Nếu là chỉnh sửa, tải dữ liệu sản phẩm
      }
    });}

  private setupToggle<T extends "promo" | "outOfStock">(
    toggleElement: ElementRef<HTMLInputElement>,
    textElement: ElementRef<HTMLElement>,
    field: T
  ) {
    if (toggleElement && textElement) {
      toggleElement.nativeElement.addEventListener("change", () => {
        const isChecked = toggleElement.nativeElement.checked;
        this.productData[field] = isChecked;
        textElement.nativeElement.innerText = isChecked ? "Có" : "Không";
        textElement.nativeElement.style.color = isChecked ? "#ffb400" : "#999";
      });

      const isChecked = Boolean(this.productData[field]);
      toggleElement.nativeElement.checked = isChecked;
      textElement.nativeElement.innerText = isChecked ? "Có" : "Không";
      textElement.nativeElement.style.color = isChecked ? "#ffb400" : "#999";
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagePreviews = []; // Xóa danh sách ảnh cũ
      this.productData.images = []; // Xóa danh sách Base64 cũ
  
      Array.from(input.files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
          this.productData.images.push(e.target.result); // Lưu Base64
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

    (document.getElementById("product-name") as HTMLInputElement).value = "";
    (document.getElementById("brand") as HTMLInputElement).value = "";
    (document.getElementById("short-description") as HTMLInputElement).value = "";
    (document.getElementById("detailed-description") as HTMLInputElement).value = "";
    (document.getElementById("wine-type") as HTMLInputElement).value = "";
    (document.getElementById("price") as HTMLInputElement).value = "";
    (document.getElementById("compare-price") as HTMLInputElement).value = "";
    (document.getElementById("volume") as HTMLInputElement).value = "";
    (document.getElementById("sku") as HTMLInputElement).value = "";

    (document.getElementById("category") as HTMLSelectElement).value = "Rượu Tây Bắc";

    this.togglePromo.nativeElement.checked = false;
    this.toggleText.nativeElement.innerText = "Không";
    this.toggleText.nativeElement.style.color = "#999";

    this.toggleOutOfStock.nativeElement.checked = false;
    this.toggleText2.nativeElement.innerText = "Không";
    this.toggleText2.nativeElement.style.color = "#999";
  }

  loadProductData(): void {
    this.http.get<any>(`http://localhost:4000/api/products/${this.productId}`).subscribe(
      (product) => {
        this.productData = {
          name: product.ProductName || "",
          brand: product.ProductBrand || "",
          category: product.CateID || "Rượu Tây Bắc",
          shortDescription: product.ShortDescription || "",
          detailedDescription: product.DetailedDescription || "",
          wineType: product.WineType || "",
          price: product.ProductPrice || "",
          comparePrice: product.ComparePrice || "",
          volume: product.Volume || "",
          sku: product.ProductSKU || "",
          promo: product.IsPromotion || false,
          outOfStock: product.AllowOutOfStock || false,
          images: product.Images || []
        };

        this.imagePreviews = this.productData.images;
      },
      (error) => {
        console.error("❌ Lỗi khi tải dữ liệu sản phẩm:", error);
      }
    );
  }


  saveProduct(): void {
    this.isSaving = true;
  
    const priceInput = (document.getElementById("price") as HTMLInputElement).value.trim();
    const formattedPrice = parseFloat(priceInput.replace(/,/g, "")) || 0;
    const categoryValue = (document.getElementById("category") as HTMLSelectElement).value;
  
    // Ánh xạ danh mục
    const categoryMapping: { [key: string]: string } = {
      "Rượu Tây Bắc": "CATE1",
      "Đồ ngâm rượu": "CATE2",
      "Phụ kiện": "CATE3",
      "Set quà rượu": "CATE4"
    };
  
    const cateID = categoryMapping[categoryValue] || "";
    const imageID = `image_${Date.now()}`;
  
    const updatedProduct = {
      ProductID: `prod_${Date.now()}`,
      ImageID: imageID,
      CateID: cateID,
      ProductName: (document.getElementById("product-name") as HTMLInputElement).value.trim() || "",
      ProductPrice: formattedPrice,
      ProductBrand: (document.getElementById("brand") as HTMLInputElement).value.trim() || "",
      ProductFullDescription: (document.getElementById("detailed-description") as HTMLTextAreaElement).value.trim() || "",
      ProductShortDescription: (document.getElementById("short-description") as HTMLInputElement).value.trim() || "",
      ProductSKU: (document.getElementById("sku") as HTMLInputElement).value.trim() || "",
      CreatedAt: new Date(),
      ProductImages: this.productData.images // ✅ Gửi danh sách ảnh Base64
    };
  
    this.http.post(`http://localhost:4000/api/products`, updatedProduct).subscribe(
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
  }
  
  
  

  
  
  
  
  

  // // Chỉ cho phép nhập số vào ô giá
  // onPriceInput(event: Event, field: "price" | "comparePrice"): void {
  //   const input = event.target as HTMLInputElement;
  //   let value = input.value;

  //   // Loại bỏ ký tự không phải số
  //   value = value.replace(/[^0-9]/g, "");

  //   // Cập nhật giá trị trong productData
  //   this.productData[field] = value;
  // }
}
