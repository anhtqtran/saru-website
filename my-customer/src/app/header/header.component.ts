import { Component, AfterViewInit  } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent{

  // Hàm toggle menu khi nhấn vào menu icon
  toggleMenu() {
    const menu = document.getElementById("nav-links");
    if (menu) {
      menu.classList.toggle("hidden");
    }
  }
  // Biến theo dõi trạng thái của ô tìm kiếm (đã mở hay chưa)
  isSearchOpen = false;

  // Hàm toggle để thay đổi trạng thái mở/đóng ô tìm kiếm
  toggleSearchBar(searchBox: HTMLInputElement) {
    this.isSearchOpen = !this.isSearchOpen;

    // Nếu ô tìm kiếm mở rộng, focus vào ô nhập liệu
    if (this.isSearchOpen) {
      setTimeout(() => {
        searchBox.focus(); // Focus vào ô tìm kiếm sau khi mở rộng
      }, 400); // Đảm bảo gọi focus sau khi hiệu ứng mở rộng hoàn thành
    }
  }
}