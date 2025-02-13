import { Component } from '@angular/core';

@Component({
  selector: 'app-trangchu-sanphamnoibat',
  standalone: false,
  templateUrl: './trangchu-sanphamnoibat.component.html',
  styleUrls: ['./trangchu-sanphamnoibat.component.css']
})
export class TrangchuSanphamnoibatComponent {
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
