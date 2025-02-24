import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-donhang-detail',
  templateUrl: './donhang-detail.component.html',
  styleUrls: ['./donhang-detail.component.css'],
  imports: [CommonModule, FormsModule]
})
export class DonhangDetailComponent implements OnInit {
  order = {
    code: 'SARUK3456',
    date: '20/01/2025',
    shippingStatus: 'Chưa giao hàng',
    paymentStatus: 'Chờ xử lý',
    items: [
      { name: 'Tên sản phẩm', quantity: 2, price: 100000, total: 200000 }
    ],
    shippingInfo: {
      code: '01234532888',
      company: 'Ahamove.vn',
      warehouse: 'Địa điểm mặc định',
      weight: '1.2 kg'
    },
    note: '',
    totalAmount: 100000,
    discount: 5000,
    finalTotal: 95000,
    paymentMethod: 'COD'
  };

  customer = {
    name: 'Trần Thị Cẩm Tú',
    orderCount: 5,
    totalRevenue: 795000,
    loyaltyPoints: 795000,
    phone: '0123456789',
    address: '10/6 Nguyễn Hồng, Phường 11, Quận Bình Thạnh, Hồ Chí Minh',
    note: 'Không có'
  };

  orderStatus: string = 'Chưa xác nhận';
  isPopupVisible: boolean = false;
  popupMessage: string = '';

  ngOnInit() {
    // Initialization logic if needed
  }

  confirmOrder() {
    if (this.orderStatus === 'Chưa xác nhận') {
      this.orderStatus = 'Đã xác nhận';
    } else {
      this.showPopup('Không thể cập nhật đơn hàng đã xác nhận');
    }
  }

  showPopup(message: string) {
    this.popupMessage = message;
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
  }

  printOrder() {
    window.print();
  }

  updateShippingOrder() {
    // Logic to update shipping order
  }

  updateOrder() {
    // Logic to update order
  }
}
