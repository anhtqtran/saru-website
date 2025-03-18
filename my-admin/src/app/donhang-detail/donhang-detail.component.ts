import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderServiceService } from '../services/order-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface Order {
  _id: string;
  OrderID: string;
  OrderDate: string;
  CustomerID: string;
  CustomerName: string;
  CustomerAdd: { address: string; city: string; state: string }; // Non-nullable object
  CustomerPhone: string;
  OrderStatusID: string;
  OrderStatusText: string;
  PaymentStatusID: string;
  PaymentStatusText: string;
  PaymentMethodID: string;
  PaymentMethodText: string;
  items: Array<{
    ProductID: string;
    Quantity: number;
    ProductName: string;
    ProductCategory: { CateName: string; CateDescription: string };
    ProductImageCover: string;
    Price: number;
    TotalPrice: number;
  }>;
  TotalOrderAmount: number;
  VoucherID?: string;
  VoucherDiscount?: number;
  VoucherDetails?: Voucher | null;
  Subtotal?: number;
  ShippingFee?: number;
  Points?: number;
  ShippingCode?: string;
  TrackingNumber?: string;
  ShippingStatus?: string;
  ShippingProvider?: string;
  Warehouse?: string;
  TotalWeight?: string;
  OrderNote?: string;
  OrderCount?: number;
  TotalRevenue?: number;
  CustomerNote?: string;
}

interface OrderStatus {
  OrderStatusID: number;
  Status: string;
}

interface PaymentStatus {
  PaymentStatusID: number;
  PaymentStatus: string;
}

interface Voucher {
  VoucherID: string;
  VoucherValue: number;
  VoucherExpiredDate: string;
  VoucherQuantity: number;
}

@Component({
  selector: 'app-donhang-detail',
  templateUrl: './donhang-detail.component.html',
  styleUrls: ['./donhang-detail.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class DonhangDetailComponent implements OnInit {
  order: Order | null = null;
  orderStatuses: OrderStatus[] = [];
  paymentStatuses: PaymentStatus[] = [];
  vouchers: Voucher[] = [];
  errMessage: string = '';
  successMessage: string = '';
  validationErrors: string[] = [];

  constructor(
    private orderService: OrderServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      const orderFromState = history.state.order;
      if (orderFromState) {
        this.order = { ...orderFromState };
        this.loadStatuses();
        this.loadVouchersAndApply();
      } else {
        this.loadOrderDetail(orderId);
      }
    } else {
      this.errMessage = 'Không tìm thấy ID đơn hàng.';
    }
  }

  loadStatuses(): void {
    forkJoin({
      orderStatuses: this.http.get<OrderStatus[]>('http://localhost:4000/order-status'),
      paymentStatuses: this.http.get<PaymentStatus[]>('http://localhost:4000/payment-status'),
    }).subscribe({
      next: ({ orderStatuses, paymentStatuses }) => {
        this.orderStatuses = orderStatuses;
        this.paymentStatuses = paymentStatuses;
        this.updateOrderStatusText();
        this.updatePaymentStatusText();
      },
      error: (err) => {
        this.errMessage = `Lỗi khi tải danh sách trạng thái: ${err.message}`;
      },
    });
  }

  loadVouchersAndApply(): void {
    this.orderService.getVouchers().subscribe({
      next: (vouchers) => {
        this.vouchers = vouchers.filter(
          (v) => new Date(v.VoucherExpiredDate) > new Date() && v.VoucherQuantity > 0
        );
        if (this.order && this.order.VoucherID) {
          this.applyVoucherFromOrder();
        }
      },
      error: (err) => {
        this.errMessage = `Lỗi khi tải danh sách voucher: ${err.message}`;
      },
    });
  }

  loadOrderDetail(orderId: string): void {
    this.orderService.getOrderById(orderId).subscribe({
      next: (orderData) => {
        const subtotal =
          orderData.items?.reduce((sum: number, item: any) => sum + (item.TotalPrice || 0), 0) || 0;
        this.order = {
          ...orderData,
          Subtotal: subtotal,
          TotalOrderAmount: orderData.TotalOrderAmount || subtotal,
          ShippingFee: orderData.ShippingFee || 5000,
          VoucherDiscount: orderData.VoucherDiscount || 0,
        };
        this.calculateTotalAmount();
        this.loadStatuses();
        this.loadVouchersAndApply();
      },
      error: (err) => {
        this.errMessage = `Lỗi khi tải chi tiết đơn hàng: ${err.message}`;
        this.order = null;
      },
    });
  }

  getVoucherValue(voucherId: string): number {
    const voucher = this.vouchers.find((v) => v.VoucherID === voucherId);
    if (this.order?.VoucherDetails && this.order.VoucherDetails.VoucherID === voucherId) {
      return this.order.VoucherDetails.VoucherValue;
    }
    return voucher ? voucher.VoucherValue : 0;
  }

  calculateTotalAmount(): void {
    if (!this.order) return;
    const subtotal = this.order.items?.reduce((sum, item) => sum + (item.TotalPrice || 0), 0) || 0;
    this.order.Subtotal = subtotal;
    this.order.TotalOrderAmount = (subtotal - (this.order.VoucherDiscount || 0)) + (this.order.ShippingFee || 0);
    this.order.Points = Math.floor(this.order.TotalOrderAmount / 1000);
  }

  applyVoucherFromOrder(): void {
    if (!this.order || !this.order.VoucherID) {
      this.errMessage = 'Không có voucher để áp dụng.';
      if (this.order) {
        this.order.VoucherDiscount = 0;
        this.calculateTotalAmount();
      }
      return;
    }

    if (this.order.VoucherDetails) {
      const voucher = this.order.VoucherDetails;
      if (new Date(voucher.VoucherExpiredDate) <= new Date()) {
        this.errMessage = `Voucher ${voucher.VoucherID} đã hết hạn!`;
        this.order.VoucherDiscount = 0;
      } else if (voucher.VoucherQuantity <= 0) {
        this.errMessage = `Voucher ${voucher.VoucherID} đã hết số lượng!`;
        this.order.VoucherDiscount = 0;
      } else {
        this.order.VoucherDiscount = this.order.VoucherDiscount || 0;
        this.successMessage = `Đã áp dụng voucher ${voucher.VoucherID}: Giảm ${voucher.VoucherValue}% (tương ứng ${this.order.VoucherDiscount} đ).`;
      }
    } else {
      const voucher = this.vouchers.find((v) => v.VoucherID === this.order!.VoucherID);
      if (voucher) {
        if (new Date(voucher.VoucherExpiredDate) <= new Date()) {
          this.errMessage = `Voucher ${voucher.VoucherID} đã hết hạn!`;
          this.order.VoucherDiscount = 0;
        } else if (voucher.VoucherQuantity <= 0) {
          this.errMessage = `Voucher ${voucher.VoucherID} đã hết số lượng!`;
          this.order.VoucherDiscount = 0;
        } else {
          const subtotal = this.order.Subtotal || 0;
          const discountPercentage = voucher.VoucherValue;
          this.order.VoucherDiscount = (subtotal * discountPercentage) / 100;
          this.successMessage = `Đã áp dụng voucher ${voucher.VoucherID}: Giảm ${discountPercentage}% (tương ứng ${this.order.VoucherDiscount} đ).`;
        }
      } else {
        this.errMessage = `Không tìm thấy voucher ${this.order.VoucherID} trong danh sách!`;
        this.order.VoucherDiscount = 0;
      }
    }
    this.calculateTotalAmount();
  }

  updateOrderStatusText(): void {
    if (this.order) {
      const status = this.orderStatuses.find((s) => s.OrderStatusID === +this.order!.OrderStatusID);
      this.order.OrderStatusText = status ? status.Status : 'Chưa giao hàng';
    }
  }

  updatePaymentStatusText(): void {
    if (this.order) {
      const status = this.paymentStatuses.find((s) => s.PaymentStatusID === +this.order!.PaymentStatusID);
      this.order.PaymentStatusText = status ? status.PaymentStatus : 'Chờ xử lý';
    }
  }

  updateOrder(): void {
    if (!this.order || !this.validateForm()) {
      this.errMessage = 'Vui lòng sửa các lỗi sau trước khi lưu: ' + this.validationErrors.join(' ');
      return;
    }

    this.updateOrderStatusText();
    this.updatePaymentStatusText();

    const updatedOrder = {
      ...this.order,
      items: this.order.items.map((item) => ({
        ProductID: item.ProductID,
        Quantity: item.Quantity,
      })),
      TotalOrderAmount: this.order.TotalOrderAmount,
      VoucherDiscount: this.order.VoucherDiscount || 0,
      Points: this.order.Points,
      VoucherID: this.order.VoucherID,
      ShippingCode: this.order.ShippingCode,
      TrackingNumber: this.order.TrackingNumber,
      ShippingStatus: this.order.ShippingStatus,
      OrderNote: this.order.OrderNote,
    };

    this.orderService.updateOrder(this.order._id, updatedOrder).subscribe({
      next: (response) => {
        this.order = { ...this.order, ...response };
        this.calculateTotalAmount();
        this.successMessage = 'Cập nhật đơn hàng thành công!';
        this.errMessage = '';
      },
      error: (err) => {
        this.errMessage = `Lỗi khi cập nhật đơn hàng: ${err.message}`;
        this.successMessage = '';
      },
    });
  }

  cancelDelivery(): void {
    if (!this.order) return;
    const cancelStatus = this.orderStatuses.find((s) => s.Status === 'Hủy');
    if (cancelStatus) {
      this.order.OrderStatusID = cancelStatus.OrderStatusID.toString();
      this.updateOrder();
    } else {
      this.errMessage = 'Không tìm thấy trạng thái "Hủy" trong danh sách trạng thái.';
    }
  }

  updateShipping(): void {
    if (!this.order) return;
    const updatedShipping = {
      ShippingCode: this.order.ShippingCode,
      TrackingNumber: this.order.TrackingNumber,
      ShippingStatus: this.order.ShippingStatus,
    };
    this.orderService.updateShipping(this.order._id, updatedShipping).subscribe({
      next: (response) => {
        this.order = { ...this.order, ...response };
        this.successMessage = 'Cập nhật vận đơn thành công!';
        this.errMessage = '';
      },
      error: (err) => {
        this.errMessage = `Lỗi khi cập nhật vận đơn: ${err.message}`;
        this.successMessage = '';
      },
    });
  }

  printShipping(): void {
    if (!this.order) {
      this.errMessage = 'Không có thông tin đơn hàng để in vận đơn.';
      return;
    }

    const shippingInfo = `
      Mã vận đơn: ${this.order.TrackingNumber || 'Chưa có'}
      Đơn vị vận chuyển: ${this.order.ShippingProvider || 'Ahamove.vn'}
      Trạng thái: ${this.order.ShippingStatus || 'Đang giao'}
      Địa chỉ giao hàng: ${this.order.CustomerAdd.address || ''}, ${this.order.CustomerAdd.city || ''}, ${this.order.CustomerAdd.state || ''}
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<pre>' + shippingInfo + '</pre>');
      printWindow.document.close();
      printWindow.print();
    } else {
      this.errMessage = 'Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt trình duyệt.';
    }
  }

  validateForm(): boolean {
    this.validationErrors = [];
    if (!this.order) return false;

    if (!this.order.CustomerID) this.validationErrors.push('Khách hàng không được để trống.');
    if (!this.order.OrderDate) this.validationErrors.push('Ngày đặt hàng không được để trống.');
    if (this.order.OrderStatusID === undefined || this.order.OrderStatusID === null)
      this.validationErrors.push('Trạng thái đơn hàng không được để trống.');
    if (!this.order.PaymentMethodID) this.validationErrors.push('Phương thức thanh toán không được để trống.');
    if (this.order.PaymentStatusID === undefined || this.order.PaymentStatusID === null)
      this.validationErrors.push('Trạng thái thanh toán không được để trống.');
    if (this.order.items.length === 0 || this.order.items.some((item) => !item.ProductID || item.Quantity <= 0)) {
      this.validationErrors.push('Phải có ít nhất một sản phẩm với số lượng hợp lệ.');
    }

    return this.validationErrors.length === 0;
  }
}