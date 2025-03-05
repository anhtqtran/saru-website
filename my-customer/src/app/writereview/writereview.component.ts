import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-writereview',
  templateUrl: './writereview.component.html',
  styleUrls: ['./writereview.component.css'],
  standalone: false
})
export class WritereviewComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedImages: string[] = [];

  // Hàm kích hoạt input file
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  // Xử lý khi người dùng chọn ảnh
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const reader = new FileReader();

        reader.onload = (e: any) => {
          this.selectedImages.push(e.target.result);
        };

        reader.readAsDataURL(file);
      }
    }
  }

  // Xóa ảnh đã tải lên
  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  stars: number[] = [1, 2, 3, 4, 5];
  rating: number = 0;
  hoverRating: number = 0;

  // Xử lý khi người dùng chọn sao
  rateProduct(star: number) {
    this.rating = star;
  }

  // Xử lý khi người dùng di chuột qua sao
  highlightStars(star: number) {
    this.hoverRating = star;
  }

  // Khi chuột rời khỏi vùng sao, reset hiệu ứng hover
  resetHighlight() {
    this.hoverRating = 0;
  }
}
