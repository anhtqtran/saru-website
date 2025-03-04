import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';


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
  };

  imagePreviews: string[] = []; // Lưu danh sách ảnh xem trước

  ngAfterViewInit() {
    this.setupToggle(this.togglePromo, this.toggleText, "promo");
    this.setupToggle(this.toggleOutOfStock, this.toggleText2, "outOfStock");
  }

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
      Array.from(input.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
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
