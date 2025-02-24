import { Component } from '@angular/core';

@Component({
  selector: 'app-trangchu-banner-camket',
  standalone: false,
  templateUrl: './trangchu-banner-camket.component.html',
  styleUrl: './trangchu-banner-camket.component.css'
})
export class TrangchuBannerCamketComponent {
  blogs = [
    { id: 1, title: 'Lịch sử rượu Tây Bắc - Tinh hoa vùng núi rừng', image: 'Blog 1.png', summary: 'Rượu Tây Bắc không chỉ là một loại thức uống mà còn là nét văn hóa truyền thống đặc sắc của các dân tộc vùng cao...' },
    { id: 2, title: 'Những loại rượu nổi tiếng ở Tây Bắc', image: 'Blog 2.png', summary: 'Tây Bắc nổi tiếng với nhiều loại rượu đặc trưng, mỗi loại mang một hương vị riêng biệt và gắn liền với đặc điểm tự nhiên của từng vùng...' }
  ];

  products = [
    { id: 1, name: 'KIM CHIẾT CORAVIN TIÊU CHUẨN', category: 'Phụ kiện', image: 'ruou nang man.png', rating: 5.0, reviews: 10, status: 'Còn hàng', price: 1386000 },
    { id: 2, name: 'TÁO MÈO KHÔ', category: 'Đồ ngâm rượu', image: 'ruou nang man.png', rating: 5.0, reviews: 10, status: 'Còn hàng', price: 140000 },
    { id: 3, name: 'SET QUÀ TẾT', category: 'Set quà rượu', image: 'ruou nang man.png', rating: 5.0, reviews: 10, status: 'Còn hàng', price: 699000 },
    { id: 4, name: 'RƯỢU NÀNG MẬN', category: 'Ruou Tay Bac', image: 'ruou nang man.png', rating: 5.0, reviews: 10, status: 'Còn hàng', price: 225000 },
    { id: 5, name: 'RƯỢU NÀNG MẬN', category: 'Ruou Tay Bac', image: 'ruou nang man.png', rating: 5.0, reviews: 10, status: 'Còn hàng', price: 225000 }
  ];

  addToCart(productName: string, price: number): void {
    alert(`${productName} đã được thêm vào giỏ hàng với giá ${price.toLocaleString()}đ!`);
  }

  compareProduct(product: any): void {
    alert(`So sánh sản phẩm: ${product.name} với các sản phẩm khác đang được phát triển!`);
  }
}
