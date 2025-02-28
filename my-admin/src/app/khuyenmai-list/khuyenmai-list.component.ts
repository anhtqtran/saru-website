import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PromotionApiService } from '../promotion-api.service';

// Interface định nghĩa cấu trúc dữ liệu khuyến mãi
interface Promotion {
  _id: string; // ID từ MongoDB
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  quantity: number;
  code: string;
  status: string;
  used: string;
  selected?: boolean;
}

@Component({
  selector: 'app-khuyenmai-list',
  templateUrl: './khuyenmai-list.component.html',
  styleUrls: ['./khuyenmai-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class KhuyenmaiListComponent implements OnInit {
  currentRole: string = 'admin';
  displayQuantity: number = 20;
  selectAllChecked: boolean = false;
  isDeletePopupVisible: boolean = false;
  filterCondition: string = '';
  searchKeyword: string = '';
  promotions: Promotion[] = [];
  filteredPromotions: Promotion[] = [];
  promotionToDelete: Promotion | null = null;
  errMessage: string = '';

  constructor(private _service: PromotionApiService, private router: Router) {}

  ngOnInit() {
    this.loadPromotions(); // Gọi API khi component khởi tạo
  }

  /**
   * Lấy danh sách khuyến mãi từ MongoDB qua API
   */
  loadPromotions() {
    this._service.getPromotions().subscribe({
        next: (data) => {
            console.log("✅ Dữ liệu nhận từ API:", data); // Debug
            this.promotions = data;
            this.filteredPromotions = [...this.promotions];
        },
        error: (err) => {
            console.error("❌ Lỗi khi gọi API:", err);
            this.errMessage = 'Lỗi khi tải danh sách khuyến mãi. Vui lòng kiểm tra API!';
        },
    });
}

  /**
   * Chuyển đổi vai trò trang (admin/customer)
   */
  changePage(role: string) {
    this.currentRole = role;
  }

  /**
   * Chọn/bỏ chọn tất cả khuyến mãi
   */
  toggleSelectAll() {
    this.selectAllChecked = !this.selectAllChecked;
    this.filteredPromotions.forEach((promotion) => (promotion.selected = this.selectAllChecked));
  }

  /**
   * Cập nhật trạng thái "Chọn tất cả" khi có thay đổi trong lựa chọn
   */
  updateSelectAllStatus() {
    this.selectAllChecked = this.filteredPromotions.every((promotion) => promotion.selected);
  }

  /**
   * Thay đổi trạng thái chọn/bỏ chọn một khuyến mãi
   */
  togglePromoSelection(promotion: Promotion) {
    promotion.selected = !promotion.selected;
    this.updateSelectAllStatus();
  }

  /**
   * Mở trang tạo khuyến mãi mới
   */
  openCreatePromotion() {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/khuyenmai-create']));
    window.open(url, '_blank');
  }

  /**
   * Chuyển đến trang chi tiết của khuyến mãi
   */
  goToPromotionDetail(promotion: Promotion) {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/khuyenmai-detail', promotion.id]));
    window.open(url, '_blank');
  }

  deletePromotion() {
    if (this.promotionToDelete) {
      this.promotions = this.promotions.filter(p => p.id !== this.promotionToDelete!.id);
      this.filteredPromotions = this.filteredPromotions.filter(p => p.id !== this.promotionToDelete!.id);
      alert('Khuyến mãi đã được xóa.');
    }
    this.closeDeletePopup();
  }

  /**
   * Hiển thị popup xác nhận xóa khuyến mãi
   */
  confirmDelete(promotion: Promotion) {
    this.promotionToDelete = promotion;
    this.isDeletePopupVisible = true;
  }

  /**
   * Đóng popup xác nhận xóa
   */
  closeDeletePopup() {
    this.isDeletePopupVisible = false;
  }

  /**
   * Áp dụng bộ lọc dựa trên điều kiện nhập vào
   */
  applyFilter() {
    this.filteredPromotions = [...this.promotions]; // Reset danh sách trước khi lọc

    if (this.filterCondition) {
      const condition = this.filterCondition.toLowerCase();

      if (condition.includes('từ ngày')) {
        const startDate = new Date(condition.split('từ ngày')[1].trim());
        this.filteredPromotions = this.filteredPromotions.filter(
          (promo) => promo.startDate && new Date(promo.startDate) >= startDate
        );
      } else if (condition.includes('đến ngày')) {
        const endDate = new Date(condition.split('đến ngày')[1].trim());
        this.filteredPromotions = this.filteredPromotions.filter(
          (promo) => promo.endDate && new Date(promo.endDate) <= endDate
        );
      } else if (condition.includes('đang khuyến mãi')) {
        this.filteredPromotions = this.filteredPromotions.filter(
          (promo) => promo.status.toLowerCase() === 'đang khuyến mãi'
        );
      }
    }

    this.updateSelectAllStatus();
  }

  /**
   * Tìm kiếm khuyến mãi theo từ khóa nhập vào
   */
  search() {
    console.log('Tìm kiếm với từ khóa:', this.searchKeyword);
    this.applyFilter(); // Lọc theo điều kiện trước

    if (this.searchKeyword) {
      const keyword = this.searchKeyword.toLowerCase();

      console.log('Danh sách trước khi lọc:', this.filteredPromotions);

      this.filteredPromotions = this.filteredPromotions.filter(
        (promo) =>
          promo.name.toLowerCase().includes(keyword) || promo.code.toLowerCase().includes(keyword)
      );

      console.log('Danh sách sau khi lọc:', this.filteredPromotions);
    }

    if (this.filteredPromotions.length === 0) {
      console.log('Không tìm thấy khuyến mãi nào.');
    }

    this.updateSelectAllStatus();
  }
}
