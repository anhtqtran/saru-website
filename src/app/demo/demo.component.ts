import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface Order {
  id: number;
  code: string;
  name: string;
  date: string;
  status: string;
  shippingStatus: string;
  paymentStatus: string;
  total: number;
  selected?: boolean;
}

@Component({
  selector: 'app-demo',
  standalone: false,
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.css'
})
export class DemoComponent {
  orders: Order[] = [
    {
      id: 1,
      code: 'SARUK1234',
      name: 'Que Anh Tran',
      date: '22/01/2025',
      status: 'Chờ xác nhận',
      shippingStatus: 'Đang giao',
      paymentStatus: 'Chưa thanh toán',
      total: 100000,
      selected: false
    },
  ];
  currentRole: string = 'admin';  // Khai báo biến role mặc định

  changePage(role: string) {  // Hàm đổi role
    this.currentRole = role;
    console.log('Vai trò hiện tại:', this.currentRole);
  }  

  onSearch() {
    console.log('Đã nhấn nút tìm kiếm');
  }  

  searchKeyword: string = '';
  statusFilter: string = '';
  shippingFilter: string = '';
  paymentFilter: string = '';
  selectAllChecked: boolean = false;
  isPopupVisible = false;
  orderToDelete: Order | null = null;

  toggleSelectAll() {
    this.filteredOrders.forEach(order => {
      order.selected = this.selectAllChecked; // Tick hoặc bỏ tick tất cả các dòng
    });
  }

  getSelectedOrders(): Order[] {
    return this.filteredOrders.filter(order => order.selected); // Lọc các đơn hàng có selected = true
  }  

  confirmDelete(event: MouseEvent, order: Order) {
    event.stopPropagation();
    this.isPopupVisible = true;
    this.orderToDelete = order;
  }

  deleteOrder() {
    if (this.orderToDelete) {
      this.orders = this.orders.filter(o => o.id !== this.orderToDelete!.id);
      alert('Đơn hàng đã được xóa.');
    }
    this.closePopup();
  }

  closePopup() {
    this.isPopupVisible = false;
    this.orderToDelete = null;
  }

  printOrder(event: MouseEvent) {
    event.stopPropagation();
    window.print();
  }

  filterOrders(order: Order) {
    const keyword = this.searchKeyword.toLowerCase();
    const status = this.statusFilter.toLowerCase();
    const shipping = this.shippingFilter.toLowerCase();
    const payment = this.paymentFilter.toLowerCase();

    if (keyword && !order.code.toLowerCase().includes(keyword)) return false;
    if (status && !order.status.toLowerCase().includes(status)) return false;
    if (shipping && !order.shippingStatus.toLowerCase().includes(shipping)) return false;
    if (payment && !order.paymentStatus.toLowerCase().includes(payment)) return false;

    return true;
  }

  get filteredOrders() {
    return this.orders.filter(order => this.filterOrders(order));
  }

  constructor(private router: Router) {}

  openCreateOrder() {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/donhang-create']));
    window.open(url, '_blank');
  }

  goToDetail(order: Order) {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/donhang-detail', order.id]));
    window.open(url, '_blank'); 
  }  
    
  selectedAction: string = ''; // Lưu giá trị hành động được chọn

  executeAction() {
    const selectedOrders = this.getSelectedOrders();
    
    if (selectedOrders.length === 0) {
      alert('Hãy chọn ít nhất một đơn hàng trước khi thực hiện thao tác!');
      return;
    }
  
    switch (this.selectedAction) {
      case 'confirmPayment':
        this.confirmPayment(selectedOrders);
        break;
      case 'verifyOrder':
        this.verifySelectedOrders(selectedOrders);
        break;
      case 'archiveOrder':
        this.archiveSelectedOrders(selectedOrders);
        break;
      case 'unarchiveOrder':
        this.unarchiveSelectedOrders(selectedOrders);
        break;
      case 'addLabel':
        this.addLabelToOrders(selectedOrders);
        break;
      case 'removeLabel':
        this.removeLabelFromOrders(selectedOrders);
        break;
      case 'deleteOrder':
        this.deleteSelectedOrders(selectedOrders);
        break;
      case 'productList':
        this.printProductList(selectedOrders);
        break;
      default:
        alert('Vui lòng chọn một thao tác!');
    }
  }
  

  confirmPayment(orders: Order[]) {
    alert(`Đã xác nhận thanh toán cho ${orders.length} đơn hàng.`);
  }
  
  verifySelectedOrders(orders: Order[]) {
    alert(`Đã xác thực ${orders.length} đơn hàng.`);
  }
  
  archiveSelectedOrders(orders: Order[]) {
    alert(`Đã lưu trữ ${orders.length} đơn hàng.`);
  }
  
  unarchiveSelectedOrders(orders: Order[]) {
    alert(`Đã bỏ lưu trữ ${orders.length} đơn hàng.`);
  }
  
  addLabelToOrders(orders: Order[]) {
    alert(`Đã thêm nhãn cho ${orders.length} đơn hàng.`);
  }
  
  removeLabelFromOrders(orders: Order[]) {
    alert(`Đã xóa nhãn khỏi ${orders.length} đơn hàng.`);
  }
  
  deleteSelectedOrders(orders: Order[]) {
    if (confirm(`Bạn có chắc chắn muốn xóa ${orders.length} đơn hàng không?`)) {
      this.orders = this.orders.filter(order => !orders.includes(order));
      alert('Đã xóa các đơn hàng đã chọn.');
    }
  }
  
  printProductList(orders: Order[]) {
    alert(`In danh sách sản phẩm của ${orders.length} đơn hàng.`);
  }  
}