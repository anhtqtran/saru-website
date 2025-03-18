<<<<<<< HEAD
import { Component } from '@angular/core';
=======
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
>>>>>>> main

@Component({
  selector: 'app-faqs',
  standalone: false,
  templateUrl: './faqs.component.html',
  styleUrl: './faqs.component.css'
})
<<<<<<< HEAD
export class FaqsComponent {
  faqs = [
    { title: 'Chính sách bảo hành', content: 'Chúng tôi cam kết cung cấp sản phẩm rượu Tây Bắc chất lượng cao. Nếu có lỗi kỹ thuật hoặc không đúng mô tả, bạn có thể yêu cầu bảo hành trong 7 ngày kể từ ngày nhận hàng. Vui lòng liên hệ kèm hình ảnh/video.', open: false },
    { title: 'Chính sách hoàn trả', content: 'Bạn có thể hoàn trả sản phẩm chưa mở nắp trong vòng 7 ngày. Chi phí vận chuyển sẽ do khách hàng chịu trừ khi sản phẩm bị lỗi. Vui lòng liên hệ để được hướng dẫn.', open: false },
    { title: 'Chính sách giao hàng', content: 'Đơn hàng sẽ được giao trong 2-5 ngày tùy địa điểm. Phí giao hàng hiển thị trước khi thanh toán. Nếu có sự cố giao hàng, chúng tôi sẽ thông báo và hỗ trợ kịp thời.', open: false },
    { title: 'Chính sách khuyến mãi', content: 'Chúng tôi cung cấp nhiều ưu đãi giảm giá và mã giảm giá vào các dịp đặc biệt. Khuyến mãi có thể có điều kiện đi kèm và không áp dụng đồng thời.', open: false },
    { title: 'Chính sách thanh toán', content: 'Chúng tôi hỗ trợ thanh toán qua chuyển khoản và COD trong nội thành. Mọi giao dịch đều được bảo mật bằng hệ thống mã hóa SSL.', open: false },
  ];
=======
export class FaqsComponent implements OnInit {
  faqs: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Gọi API để lấy danh sách FAQs từ MongoDB
    this.http.get('http://localhost:4000/faqs').subscribe(
      (response: any) => {
        this.faqs = response.map((faq: any) => ({
          _id: faq._id,
          title: faq.FaqTitle, // Ánh xạ FaqTitle từ MongoDB
          content: faq.FaqContent, // Ánh xạ FaqContent từ MongoDB
          open: false // Thêm trạng thái open mặc định
        }));
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách FAQs:', error);
      }
    );
  }
>>>>>>> main

  toggleAccordion(item: any) {
    item.open = !item.open;
  }
}
