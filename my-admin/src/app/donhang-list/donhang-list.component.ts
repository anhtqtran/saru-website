import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../order-service.service';


interface Order {
  _id: string;
  OrderID: string;
  CustomerID: string;
  OrderDate: string;
  OrderStatusID: number;
  OrderStatusText?: string;
  PaymentStatusID: number;  
  PaymentStatusText?: string; 
  Amount: number;
  selected?: boolean;
}

@Component({
  selector: 'app-donhang-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FormsModule],
  templateUrl: './donhang-list.component.html',
  styleUrls: ['./donhang-list.component.css']
})


export class DonhangListComponent implements OnInit {
  orders: Order[] = [];
  displayedOrders: Order[] = [];
  filteredOrders: Order[] = [];
  currentRole: string = 'admin';  
  searchKeyword: string = '';
  statusFilter: string = '';
  paymentFilter: string = '';
  selectAllChecked: boolean = false;
  isPopupVisible = false;
  orderToDelete: Order | null = null;
  errMessage: string = '';
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalOrders: number = 0;
  totalPages: number = 0;
  item: any;

  constructor(private router: Router, private orderService: OrderService) {}

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = [...this.orders];
        this.totalOrders = this.orders.length;
        this.updateDisplayedOrders(); 
      },
      error: (err) => {
        this.errMessage = err.message;
        console.error("Lỗi khi lấy danh sách đơn hàng:", err);
      }
    });
  }

  changePage(role: string) {  // Hàm đổi role
    this.currentRole = role;
    console.log('Vai trò hiện tại:', this.currentRole);
  }    

  toggleSelectAll() {
    this.orders.forEach(order => order.selected = this.selectAllChecked);
  }

  getSelectedOrders(): Order[] {
    return this.orders.filter(order => order.selected);
  } 

  confirmDelete(event: MouseEvent, order: Order) {
    event.stopPropagation();
    this.isPopupVisible = true;
    this.orderToDelete = order;
  }

  deleteOrder() {
    if (this.orderToDelete) {
      this.orderService.deleteOrder(this.orderToDelete._id).subscribe({
        next: (response) => {
          if (response.success) {
            // Cập nhật lại danh sách đơn hàng
            this.orders = this.orders.filter(o => o._id !== this.orderToDelete!._id);
            this.filteredOrders = this.filteredOrders.filter(o => o._id !== this.orderToDelete!._id);
            this.updateDisplayedOrders();  // Cập nhật bảng
            this.closePopup();  // Đóng pop-up
            alert('Đơn hàng đã được xóa thành công.');
          } else {
            alert(response.message);
          }
        },
        error: (err) => {
          console.error('Lỗi khi xóa đơn hàng:', err);
          alert('Lỗi khi xóa đơn hàng.');
        }
      });
    }
  }    


  closePopup() {
    this.isPopupVisible = false;
    this.orderToDelete = null;
  }

  printOrder(event: MouseEvent) {
    event.stopPropagation();
    window.print();
  }

  onSearch() {
    this.filteredOrders = this.orders.filter(order => this.filterOrders());
  }

  filterOrders() {
    const keyword = this.searchKeyword?.toLowerCase().trim() ?? "";
    const status = this.statusFilter?.toLowerCase().trim() ?? "";
    const payment = this.paymentFilter?.toLowerCase().trim() ?? "";
  
    // Lọc danh sách đơn hàng dựa trên từ khóa, trạng thái và thanh toán
    this.filteredOrders = this.orders.filter(order => (
      (!keyword || (order.OrderID?.toLowerCase().includes(keyword) || order.CustomerID?.toLowerCase().includes(keyword))) &&
      (!status || (order.OrderStatusText?.toLowerCase() ?? "").includes(status)) &&
      (!payment || (order.PaymentStatusText?.toLowerCase() ?? "").includes(payment))
    ));    
  
    // Reset về trang đầu tiên sau khi lọc
    this.currentPage = 1;
  
    // Cập nhật danh sách đơn hàng hiển thị theo trang
    this.updateDisplayedOrders();
  }

  clearFilters() {
    // Đặt lại tất cả bộ lọc về giá trị mặc định
    this.searchKeyword = '';
    this.statusFilter = '';
    this.paymentFilter = '';
  
    // Cập nhật lại filteredOrders để hiển thị tất cả đơn hàng
    this.filteredOrders = [...this.orders];
  
    // Reset về trang đầu tiên để hiển thị lại đúng dữ liệu
    this.currentPage = 1;
    
    // Cập nhật danh sách đơn hàng hiển thị theo trang
    this.updateDisplayedOrders();
  }
  

  // Hiển thị tổng số đơn hàng
  getTotalOrders(): number {
    return this.totalOrders;
  }

  openCreateOrder() {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/donhang-create']));
    window.open(url, '_blank');
  }

  goToDetail(order: Order) {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/donhang-detail', order._id]));
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

  getOrderStatusID(order: any): string {
    const statusMap: { [key: string]: string } = {
      "Đã hủy đơn": "Đã hủy đơn",
      "Chờ xác nhận": "Chờ xác nhận",
      "Đã xác nhận": "Đã xác nhận",
      "Đang vận chuyển": "Đang vận chuyển",
      "Giao hàng thành công": "Giao hàng thành công"
    };
  
    return statusMap[order.OrderStatusID] || "Đã xác nhận";
  }  

  updateDisplayedOrders() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedOrders = this.filteredOrders.slice(startIndex, endIndex);
  }
  
  // Chuyển đến trang tiếp theo
  nextPage() {
    const totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.updateDisplayedOrders();
    }
  }
  
  // Chuyển đến trang trước
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedOrders();
    }
  }
  
  // Cập nhật số lượng đơn hàng mỗi trang
  changeItemsPerPage() {
    this.currentPage = 1; // Reset về trang đầu khi thay đổi số lượng
    this.updateDisplayedOrders();
  }
  
  // Cập nhật tổng số trang khi dữ liệu thay đổi
  ngOnChanges() {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }
  getTotalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }
  
}
