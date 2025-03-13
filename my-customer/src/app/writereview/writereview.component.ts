import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Review } from '../classes/Reviews';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-writereview',
  templateUrl: './writereview.component.html',
  styleUrl: './writereview.component.css',
  imports: [CommonModule, FormsModule]
})
export class WritereviewComponent implements OnInit {
  orderId: string = ''; // Lưu OrderID
  orderProducts: any[] = []; // Danh sách sản phẩm cần đánh giá

  constructor(private route: ActivatedRoute, private http: HttpClient, public router: Router) {}

  ngOnInit() {
    // 📌 Nhận OrderID và danh sách sản phẩm từ `queryParams`
    this.route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.orderId = params['orderId'];
      }
      if (params['products']) {
        this.orderProducts = JSON.parse(params['products']);
        this.orderProducts.forEach(product => {
          product.rating = 0;
          product.hoverRating = 0; // ✅ Thêm biến hover riêng cho từng sản phẩm
          product.reviewContent = '';
        });
      }
    });
  }

  highlightStars(product: any, star: number) {
    product.hoverRating = star; // ✅ Chỉ sản phẩm đó bị ảnh hưởng
  }

  resetHighlight(product: any) {
    product.hoverRating = 0; // ✅ Chỉ reset hover của sản phẩm đó
  }

  // submitReview() {
  //   let reviewsToSubmit: Review[] = [];

  //   this.orderProducts.forEach(product => {
  //     if (!product.rating || !product.reviewContent?.trim()) {
  //       alert("❌ Vui lòng nhập đánh giá và chọn số sao cho tất cả sản phẩm!");
  //       return;
  //     }

  //     reviewsToSubmit.push({
  //       ReviewID: `review_${new Date().getTime()}`,
  //       ProductID: product.id,
  //       CustomerID: "cus1", // Tạm thời dùng ID giả định
  //       Content: product.reviewContent,
  //       Rating: product.rating,
  //       DatePosted: new Date().toISOString()
  //     });
  //   });

  //   // ✅ Gửi đánh giá lên server
  //   this.http.post('http://localhost:4000/api/reviews', reviewsToSubmit).subscribe(
  //     () => {
  //       alert("✅ Đánh giá của bạn đã được gửi thành công!");
  //       this.router.navigate(['/orderdetail'], { queryParams: { orderId: this.orderId } });
  //     },
  //     error => {
  //       alert("❌ Có lỗi xảy ra khi gửi đánh giá!");
  //       console.error("Lỗi gửi đánh giá:", error);
  //     }
  //   );
  // }


  submitReview() {
    let reviewsToSubmit: Review[] = [];
  
    this.orderProducts.forEach(product => {
      if (!product.rating || !product.reviewContent?.trim()) {
        alert(`❌ Vui lòng nhập đánh giá và chọn số sao cho sản phẩm: ${product.name}!`);
        return;
      }
  
      // Kiểm tra xem ProductID có tồn tại không
      if (!product.id) {
        console.error(`❌ Thiếu ProductID cho sản phẩm: ${product.name}`);
        alert("❌ Lỗi hệ thống! Không tìm thấy ID sản phẩm.");
        return;
      }
  
      // Lấy CustomerID từ localStorage (hoặc API)
      const customerID = localStorage.getItem("CustomerID");
      if (!customerID) {
        alert("❌ Lỗi: Không tìm thấy thông tin khách hàng!");
        return;
      }
  
      // Tạo đối tượng review
      let reviewData: Review = {
        ReviewID: `review_${Date.now()}`, // ID duy nhất
        ProductID: product.id, // Kiểm tra xem giá trị này có đúng không
        CustomerID: customerID, // Lấy từ localStorage thay vì hardcode
        Content: product.reviewContent,
        Rating: product.rating,
        DatePosted: new Date().toISOString() // Chuyển ngày thành định dạng chuẩn ISO 8601
      };
  
      reviewsToSubmit.push(reviewData);
    });
  
    if (reviewsToSubmit.length === 0) {
      alert("❌ Không có đánh giá hợp lệ để gửi!");
      return;
    }
  
    console.log("✅ Dữ liệu đánh giá gửi lên API:", reviewsToSubmit);
  
    // ✅ Gửi đánh giá lên server
    this.http.post('http://localhost:4000/api/reviews', reviewsToSubmit).subscribe(
      () => {
        alert("✅ Đánh giá của bạn đã được gửi thành công!");
        this.router.navigate(['/orderdetail'], { queryParams: { orderId: this.orderId } });
      },
      error => {
        alert("❌ Có lỗi xảy ra khi gửi đánh giá! Hãy kiểm tra lại dữ liệu.");
        console.error("Lỗi gửi đánh giá:", error);
      }
    );
  }
  
}
