import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-donhang-detail',
  templateUrl: './donhang-detail.component.html',
  styleUrls: ['./donhang-detail.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule] 
})
export class DonhangDetailComponent implements OnInit {
  order: any = {
    shippingInfo: {
      company: '',
      warehouse: '',
      weight: 0
    }
  };  // Chứa thông tin đơn hàng
  customer: any = {};  // Chứa thông tin khách hàng
  orderStatus: string = '';  // Trạng thái đơn hàng
  isPopupVisible: boolean = false;
  popupMessage: string = '';
  orderDetails: any[] = [];  // Chi tiết đơn hàng
  products: any[] = [];  // Sản phẩm trong đơn hàng

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
  ) {}
  
  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');

    if (!orderId) {
      console.error("Lỗi: orderId không hợp lệ.");
      return;
    }

    // Gọi API để lấy thông tin đơn hàng + ánh xạ dữ liệu từ nhiều collection
    this.orderService.getOrderById(orderId).subscribe(
      (data) => {
        this.order = {
          OrderID: data.OrderID,
          OrderDate: data.OrderDate,
          PaymentStatus: data.PaymentStatus, 
          PaymentMethod: data.PaymentMethod,
          Status: data.Status, 
          CustomerID: data.CustomerID, 
          CustomerName: data.CustomerName, 
          items: data.orderDetails.map((detail: any) => ({
            ProductID: detail.ProductID,
            Quantity: detail.Quantity,
            ProductName: data.products.find((p: any) => p.ProductID === detail.ProductID)?.ProductName || 'Không xác định',
            ProductPrice: data.products.find((p: any) => p.ProductID === detail.ProductID)?.ProductPrice || 0,
            TotalPrice: (data.products.find((p: any) => p.ProductID === detail.ProductID)?.ProductPrice || 0) * detail.Quantity
          }))
        };

        console.log("Dữ liệu đơn hàng:", this.order);
      },
      (error) => {
        console.error("Lỗi khi lấy đơn hàng:", error);
      }
    );
  }
  updateShippingOrder() {
    // Chức năng cập nhật thông tin vận đơn
    console.log("Cập nhật vận đơn cho đơn hàng");
  }

  printOrder() {
    // Chức năng in vận đơn
    console.log("In vận đơn cho đơn hàng");
  }

  updateOrder() {
    // Cập nhật đơn hàng
    console.log("Cập nhật đơn hàng");
  }

  showPopup(message: string) {
    this.popupMessage = message;
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
  }

  // Phương thức confirmOrder() để xử lý xác nhận đơn hàng
  confirmOrder() {
    console.log("Đơn hàng đã được xác nhận:", this.order.OrderID ?? "Không xác định");
    // Bạn có thể thực hiện các thao tác khác tại đây, ví dụ như cập nhật trạng thái đơn hàng
  }

  getTotalAmount(): number {
    return this.order.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
  }
  
  getDiscount(): number {
    return this.order.discount || 0;
  }
  
  getFinalTotal(): number {
    return this.getTotalAmount() - this.getDiscount();
  }

}
