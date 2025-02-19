import { Component, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-productlist',
  templateUrl: './productlist.component.html',
  styleUrls: ['./productlist.component.css']
})
export class ProductlistComponent implements AfterViewInit {

  @ViewChild('filterToggle', { static: false }) filterToggle!: ElementRef<HTMLButtonElement>;
  @ViewChild('filterBox', { static: false }) filterBox!: ElementRef<HTMLElement>;
  @ViewChild('cancelFilter', { static: false }) cancelFilter!: ElementRef<HTMLButtonElement>;

  constructor(private renderer: Renderer2) {}

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
}
