import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { PaymentInfo } from '../classes/Payment';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-paymentdetail',
  standalone: false,
  templateUrl: './paymentdetail.component.html',
  styleUrl: './paymentdetail.component.css',
})
export class PaymentdetailComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
  selectedPaymentMethod: string = ''; // Lưu phương thức thanh toán được chọn
  showError: boolean = false; // Kiểm soát hiển thị lỗi
  provinces: string[] = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định",
    "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk",
    "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh",
    "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum",
    "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận",
    "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
    "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh",
    "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
  ];
  paymentMethods = ["Thanh toán khi nhận hàng", "Ngân hàng", "Ví điện tử"];
  eWallets = ["Momo", "ZaloPay", "VNPay", "ShopeePay", "Viettel Money"]; // 🔥 Danh sách ví điện tử
  shippingFee: number = 0;  // ✅ Thêm phí vận chuyển
  discount: number = 0;  // ✅ Thêm giảm giá
  selectedProvince: string = "";
  selectedEWallet: string = "";
  paymentInfo: PaymentInfo = new PaymentInfo();
  payment = new PaymentInfo();

  constructor(private cartService: CartService, private router: Router) { }

  ngOnInit() {
    this.cartItems = this.cartService.getCart(); // Lấy dữ liệu giỏ hàng
    this.totalPrice = this.cartService.getTotalPrice(); // Tính tổng tiền
  }

  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
    this.showError = false; // Ẩn lỗi khi người dùng chọn phương thức thanh toán
  }

  proceedToPayment() {
    if (!this.selectedPaymentMethod) {
      this.showError = true; // Hiển thị lỗi nếu chưa chọn phương thức thanh toán
      return;
    }
    // Chuyển đến bước thanh toán (có thể điều hướng đến API thanh toán hoặc trang xác nhận)
    console.log('Tiến hành thanh toán với phương thức:', this.selectedPaymentMethod);
  }

  showEWalletOptions(): boolean {
    return this.selectedPaymentMethod === "Ví điện tử";
  }

  isPaymentValid(): boolean {
    if (this.selectedPaymentMethod === "Ví điện tử") {
      return this.selectedEWallet !== ""; // Yêu cầu chọn ví điện tử nếu chọn "Ví điện tử"
    }
    return this.selectedPaymentMethod !== "";
  }

  checkout() {
    if (!this.isPaymentValid()) {
      alert("Bạn phải chọn phương thức thanh toán trước khi đặt hàng!");
      return;
    }
    alert("Thanh toán thành công!");
  }

  confirmOrder() {
    if (this.paymentInfo.validate()) {
      alert('Xác nhận thành công! Chuyển sang bước tiếp theo.');
      // Thực hiện điều hướng tiếp theo
    }
  }


  // processPayment() {
  //   console.log("💡 Dữ liệu nhập:", this.paymentInfo);

  //   if (this.paymentInfo.validate()) {
  //     console.log("✅ Thông tin hợp lệ, chuẩn bị chuyển hướng...");

  //     // Kiểm tra xem PaymentsuccessfulComponent có tồn tại không
  //     this.router.navigate(['/paymentsuccessful']).then(success => {
  //       if (success) {
  //         console.log("🎉 Chuyển trang thành công!");
  //       } else {
  //         console.error("❌ Không thể điều hướng!");
  //       }
  //     }).catch(error => console.error("🚨 Lỗi điều hướng:", error));
  //   } else {
  //     console.log("❌ Có lỗi trong biểu mẫu. Không thể chuyển trang.");
  //     console.log("🔎 Lỗi hiện tại:", this.paymentInfo.errorMessages);
  //   }
  // }


  processPayment() {
    console.log("💡 Dữ liệu nhập:", this.paymentInfo);
  
    if (this.paymentInfo.validate()) {
      console.log("✅ Thông tin hợp lệ, chuẩn bị chuyển hướng...");
  
      // 🛒 Lưu thông tin đơn hàng vào localStorage để lấy lại ở `orderdetail`
      const orderData = {
        orderId: Math.floor(100000000 + Math.random() * 900000000), // Random Order ID
        orderDate: new Date().toLocaleDateString(), // Ngày đặt hàng
        cartItems: this.cartItems, // Sản phẩm đã đặt
        totalPrice: this.totalPrice, // Tổng tiền sản phẩm
        shippingInfo: {
          fullName: this.paymentInfo.fullName,
          phoneNumber: this.paymentInfo.phoneNumber,
          address: this.paymentInfo.selectedProvince + ", " + this.paymentInfo.address
        },
        shippingFee: this.shippingFee, // ✅ Lấy chính xác Phí vận chuyển từ Payment
        discount: this.discount // ✅ Lấy chính xác Giảm giá từ Payment
      };
  
      localStorage.setItem('orderData', JSON.stringify(orderData));
  
      // 👉 Điều hướng sang trang chi tiết đơn hàng
      this.router.navigate(['/orderdetail']).then(success => {
        if (success) {
          console.log("🎉 Chuyển trang thành công!");
        } else {
          console.error("❌ Không thể điều hướng!");
        }
      }).catch(error => console.error("🚨 Lỗi điều hướng:", error));
    } else {
      console.log("❌ Có lỗi trong biểu mẫu. Không thể chuyển trang.");
      console.log("🔎 Lỗi hiện tại:", this.paymentInfo.errorMessages);
    }
  }
  



}
