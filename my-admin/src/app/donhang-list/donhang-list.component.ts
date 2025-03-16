import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderServiceService } from '../services/order-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

interface Order {
  _id: string;
  OrderID: string;
  CustomerID: string;
  CustomerName?: string;
  CustomerAdd?: { address: string; city: string; state: string };
  CustomerPhone?: string;
  OrderDate: string;
  createdAt: string;
  OrderStatusID: number;
  OrderStatusText?: string;
  PaymentStatusID: string;
  PaymentStatusText?: string;
  PaymentMethodID: string;
  PaymentMethodText?: string;
  items: {
    ProductID: string;
    Quantity: number;
    ProductName?: string;
    ProductCategory?: { CateName: string; CateDescription: string };
    ProductImageCover?: string;
    Price?: number;
    TotalPrice?: number;
  }[];
  TotalOrderAmount?: number;
  selected?: boolean;
}

@Component({
  selector: 'app-donhang-list',
  templateUrl: './donhang-list.component.html',
  styleUrls: ['./donhang-list.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, CurrencyPipe, DatePipe],
})
export class DonhangListComponent implements OnInit {
  orders: Order[] = [];
  displayedOrders: Order[] = [];
  selectedOrders: string[] = [];
  selectAllChecked: boolean = false;
  currentRole: string = 'admin';
  itemsPerPage: number = 5;
  currentPage: number = 1;
  searchKeyword: string = '';
  statusFilter: string = '';
  paymentFilter: string = '';
  selectedAction: string = '';
  isPopupVisible: boolean = false;
  orderToDelete: Order | null = null;

  constructor(
    private router: Router,
    private orderService: OrderServiceService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data.map(order => ({ ...order, selected: false }));
        this.updateDisplayedOrders();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách đơn hàng:', err);
        alert('Không thể tải danh sách đơn hàng');
      },
    });
  }

  updateOrderStatus(orderId: string, newStatus: number) {
    if (!orderId) return;

    const orderData = { OrderStatusID: newStatus };
    this.orderService.updateOrder(orderId, orderData).subscribe({
      next: (response) => {
        console.log('Cập nhật thành công:', response);
        alert('Cập nhật đơn hàng thành công!');
        this.loadOrders();
      },
      error: (error) => {
        console.error('Lỗi khi cập nhật:', error);
        alert(error.message || 'Cập nhật thất bại');
      }
    });
  }

  updateDisplayedOrders(): void {
    let filtered = this.orders;

    if (this.searchKeyword) {
      filtered = filtered.filter(order =>
        order.OrderID.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        order.CustomerID.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(order => order.OrderStatusText === this.statusFilter);
    }

    if (this.paymentFilter) {
      filtered = filtered.filter(order => order.PaymentStatusText === this.paymentFilter);
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedOrders = filtered.slice(start, end);
  }

  changePage(role: string): void {
    this.currentRole = role;
    this.loadOrders();
  }

  changeItemsPerPage(): void {
    this.currentPage = 1;
    this.updateDisplayedOrders();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updateDisplayedOrders();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.orders.length / this.itemsPerPage);
  }

  getTotalOrders(): number {
    return this.orders.length;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateDisplayedOrders();
  }

  clearFilters(): void {
    this.searchKeyword = '';
    this.statusFilter = '';
    this.paymentFilter = '';
    this.currentPage = 1;
    this.updateDisplayedOrders();
  }

  openCreateOrder(): void {
    this.router.navigate(['/add-order']);
  }

  onEdit(orderId: string): void {
    this.router.navigate([`/donhang-detail/${orderId}`]);
  }

  printOrder(event: Event): void {
    event.stopPropagation();
    console.log('In đơn hàng');
  }

  confirmDelete(event: Event, order: Order): void {
    event.stopPropagation();
    this.orderToDelete = order;
    this.isPopupVisible = true;
  }

  deleteOrder(): void {
    if (this.orderToDelete) {
      const orderId = this.orderToDelete._id;
      this.orderService.deleteOrder(orderId).subscribe({
        next: (response) => {
          console.log('Xóa đơn hàng thành công:', response);
          this.orders = this.orders.filter(order => order._id !== orderId);
          this.updateDisplayedOrders();
          this.closePopup();
          alert('Xóa đơn hàng thành công!');
        },
        error: (err) => {
          console.error('Lỗi khi xóa đơn hàng:', err);
          if (err.message.includes('404')) {
            this.orders = this.orders.filter(order => order._id !== orderId);
            this.updateDisplayedOrders();
            this.closePopup();
            alert('Xóa đơn hàng thành công!');
          } else {
            alert('Không thể xóa đơn hàng');
          }
        },
      });
    }
  }

  closePopup(): void {
    this.isPopupVisible = false;
    this.orderToDelete = null;
  }

  toggleSelectAll(): void {
    this.displayedOrders.forEach(order => (order.selected = this.selectAllChecked));
    this.selectedOrders = this.selectAllChecked
      ? this.displayedOrders.map(order => order._id)
      : [];
  }

  onSelectOrder(orderId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const order = this.displayedOrders.find(o => o._id === orderId);
    if (order) {
      order.selected = target.checked;
      if (target.checked) {
        this.selectedOrders.push(orderId);
      } else {
        this.selectedOrders = this.selectedOrders.filter(id => id !== orderId);
      }
      this.selectAllChecked = this.displayedOrders.every(order => order.selected);
    }
  }

  executeAction(): void {
    if (!this.selectedAction) {
      alert('Vui lòng chọn một thao tác để thực hiện.');
      return;
    }

    if (this.selectedOrders.length === 0) {
      alert('Vui lòng chọn ít nhất một đơn hàng để thực hiện thao tác.');
      return;
    }

    switch (this.selectedAction) {
      case 'verifyOrders':
        this.verifyOrders();
        break;
      case 'confirmPayment':
        this.confirmPayment();
        break;
      case 'deleteSelected':
        this.deleteSelectedOrders();
        break;
      case 'archiveOrder':
      case 'unarchiveOrder':
      case 'addLabel':
      case 'removeLabel':
      case 'productList':
        alert(`Chức năng ${this.selectedAction} chưa được triển khai.`);
        break;
      default:
        alert('Thao tác không hợp lệ.');
    }
    this.selectedAction = '';
  }

  verifyOrders(): void {
    const updatePromises = this.selectedOrders.map(orderId => {
      const order = this.orders.find(o => o._id === orderId);
      if (order) {
        return this.orderService.updateOrder(orderId, {
          OrderStatusID: 1,
          OrderStatusText: 'Đã xác nhận',
        }).toPromise();
      }
      return Promise.resolve();
    });

    Promise.all(updatePromises)
      .then(() => {
        alert('Xác thực đơn hàng thành công!');
        this.loadOrders();
      })
      .catch(err => {
        console.error('Lỗi khi xác thực đơn hàng:', err);
        alert('Xác thực đơn hàng thành công!');
      });
  }

  confirmPayment(): void {
    const updatePromises = this.selectedOrders.map(orderId => {
      const order = this.orders.find(o => o._id === orderId);
      if (order) {
        return this.orderService.updateOrder(orderId, {
          PaymentStatusID: '1',
          PaymentStatusText: 'Đã thanh toán',
        }).toPromise();
      }
      return Promise.resolve();
    });

    Promise.all(updatePromises)
      .then(() => {
        alert('Xác nhận thanh toán thành công!');
        this.loadOrders();
      })
  }

  deleteSelectedOrders(): void {
    const deletePromises = this.selectedOrders.map(orderId => {
      return this.orderService.deleteOrder(orderId).toPromise().catch(err => {
        if (err.message.includes('404')) {
          return { success: true, message: `Đơn hàng đã được xóa` };
        }
        throw err;
      });
    });

    Promise.all(deletePromises)
      .then(() => {
        alert('Xóa đơn hàng thành công!');
        this.orders = this.orders.filter(order => !this.selectedOrders.includes(order._id));
        this.selectedOrders = [];
        this.selectAllChecked = false;
        this.updateDisplayedOrders();
      })
  }
}