import { Component } from '@angular/core';

@Component({
  selector: 'app-orderhistory',
  templateUrl: './orderhistory.component.html',
  styleUrls: ['./orderhistory.component.css'],
  standalone: false
})
export class OrderhistoryComponent {
  // Danh sách đơn hàng
  orders = [
    { code: 'SARUK1234', date: '20/01/2025', total: '100.000đ', payment: 'Chuyển khoản', status: 'Chờ xác nhận', selected: false },
    { code: 'SARUK1235', date: '21/01/2025', total: '200.000đ', payment: 'Tiền mặt', status: 'Hoàn thành', selected: false },
    { code: 'SARUK1236', date: '22/01/2025', total: '300.000đ', payment: 'Chuyển khoản', status: 'Đã huỷ', selected: false },
    { code: 'SARUK1237', date: '23/01/2025', total: '400.000đ', payment: 'Chuyển khoản', status: 'Đang giao', selected: false },
    { code: 'SARUK1238', date: '24/01/2025', total: '500.000đ', payment: 'Tiền mặt', status: 'Hoàn thành', selected: false }
  ];

  // Tuỳ chọn số hàng hiển thị
  rowOptions = [10, 20, 50, 100];
  selectedRows = 10;
  displayedOrders = this.orders.slice(0, this.selectedRows);

  // Trạng thái chọn tất cả
  selectAll: boolean = false;

  // Cập nhật số lượng hàng hiển thị
  updateRows() {
    this.displayedOrders = this.orders.slice(0, this.selectedRows);
    this.selectAll = false; // Reset trạng thái chọn tất cả
  }

  // Hàm chọn tất cả checkbox
  toggleSelectAll() {
    this.displayedOrders.forEach(order => order.selected = this.selectAll);
  }

  // Hàm kiểm tra trạng thái checkbox "chọn tất cả"
  updateSelectAllState() {
    this.selectAll = this.displayedOrders.every(order => order.selected);
  }
}
