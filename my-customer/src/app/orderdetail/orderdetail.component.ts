import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orderdetail',
  standalone: false,
  templateUrl: './orderdetail.component.html',
  styleUrl: './orderdetail.component.css'
})
export class OrderdetailComponent implements OnInit {
  orderData: any = null;
  constructor(private router: Router) {}
  ngOnInit() {
    // Lấy dữ liệu từ `localStorage`
    const storedOrder = localStorage.getItem('orderData');
    if (storedOrder) {
      this.orderData = JSON.parse(storedOrder);
    } else {
      console.error("Không tìm thấy dữ liệu đơn hàng!");
    }
  }

  // goToWriteReview() {
  //   console.log("📢 Điều hướng đến trang viết đánh giá...");
  //   this.router.navigate(['/writereview']).then(success => {
  //     if (success) {
  //       console.log("✅ Chuyển trang thành công!");
  //     } else {
  //       console.error("❌ Không thể điều hướng!");
  //     }
  //   }).catch(error => console.error("🚨 Lỗi điều hướng:", error));
  // }

  goToWriteReview() {
    if (!this.orderData || !this.orderData.cartItems?.length) {
      alert("❌ Không có sản phẩm nào để đánh giá!");
      return;
    }

    console.log("📢 Điều hướng đến trang viết đánh giá...");

    // ✅ Chuyển danh sách sản phẩm và OrderID sang `writereview`
    this.router.navigate(['/writereview'], {
      queryParams: {
        orderId: this.orderData.orderId,
        products: JSON.stringify(this.orderData.cartItems)
      }
    });
  }
}