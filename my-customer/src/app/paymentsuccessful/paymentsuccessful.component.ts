import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-paymentsuccessful',
<<<<<<< HEAD
  // standalone: false,
=======
  standalone: false,
>>>>>>> main
  templateUrl: './paymentsuccessful.component.html',
  styleUrl: './paymentsuccessful.component.css'
})
export class PaymentsuccessfulComponent {
  constructor(private router: Router) {
    console.log("🎉 Trang thanh toán thành công đã được load!");
  }

  goHome() {
    this.router.navigate(['/homepage']);
  }

  viewOrderDetail() {
    console.log("Chuyển hướng đến trang chi tiết đơn hàng...");
    this.router.navigate(['/orderdetail']).then(success => {
      if (success) {
        console.log("Chuyển trang thành công!");
      } else {
        console.error("Không thể điều hướng!");
      }
    }).catch(error => console.error("Lỗi điều hướng:", error));
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> main
