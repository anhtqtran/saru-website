import { Component } from '@angular/core';

@Component({
  selector: 'app-trangchu-blog',
  standalone: false,
  templateUrl: './trangchu-blog.component.html',
  styleUrl: './trangchu-blog.component.css'
})
export class TrangchuBlogComponent {
  blogs = [
    { id: 1, title: 'Lịch sử rượu Tây Bắc - Tinh hoa vùng núi rừng', image: 'Blog 1.png', summary: 'Rượu Tây Bắc không chỉ là một loại thức uống mà còn là nét văn hóa truyền thống đặc sắc của các dân tộc vùng cao...' },
    { id: 2, title: 'Những loại rượu nổi tiếng ở Tây Bắc', image: 'Blog 2.png', summary: 'Tây Bắc nổi tiếng với nhiều loại rượu đặc trưng, mỗi loại mang một hương vị riêng biệt và gắn liền với đặc điểm tự nhiên của từng vùng...' }
  ];
}
