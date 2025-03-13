import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
<<<<<<< HEAD

interface Promotion {
  id: number;
  name: string;
  time: string;
  code: string;
  status: string;
  used: string;
  selected: boolean;
  startDate?: string;
  endDate?: string;
=======
import { PromotionApiService } from '../promotion-api.service';

interface Promotion {
  _id: string;
  type: 'promotion' | 'voucher';
  id: string;
  startDate: string;
  endDate: string;
  conditionId: number;
  conditionStatus: string;
  quantity?: number;
  remainingQuantity?: number;
  value: number;
  status: string;
  selected?: boolean;
  applicableScope: string | string[];
  applicableScopeDisplay?: string;
>>>>>>> feature_quanlykhuyenmai
}

@Component({
  selector: 'app-khuyenmai-list',
  templateUrl: './khuyenmai-list.component.html',
  styleUrls: ['./khuyenmai-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class KhuyenmaiListComponent implements OnInit {
<<<<<<< HEAD
  currentRole: string = 'admin';
  promos: Promotion[] = [
    {
      id: 1,
      name: 'Tên khuyến mãi',
      time: 'Thời gian',
      code: 'SARUSALE',
      status: 'Đang khuyến mãi',
      used: '10/50',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      selected: false
    }
  ];
  displayQuantity: number = 20;
  selectAllChecked: boolean = false;
  isDeletePopupVisible: boolean = false;
  promotionToDelete: Promotion | null = null;
  filterCondition: string = '';
  searchKeyword: string = '';
  filteredPromos: Promotion[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.filteredPromos = [...this.promos];
=======
  ngOnInit(): void {
    this.loadPromotions();
  }
  currentRole: string = 'admin';
  displayQuantity: number = 20;
  selectAllChecked: boolean = false;
  isDeletePopupVisible: boolean = false;
  isBulkDeletePopupVisible: boolean = false;
  isBulkEndPopupVisible: boolean = false;
  filterCondition: string = '';
  searchKeyword: string = '';
  filterType: 'all' | 'promotion' | 'voucher' = 'all';
  filterStatus: string = '';
  promotions: Promotion[] = [];
  filteredPromotions: Promotion[] = [];
  pagedPromotions: Promotion[] = [];
  promotionToDelete: Promotion | null = null;
  errMessage: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  categories: { [key: string]: string } = {};

  constructor(private _service: PromotionApiService, private router: Router) {}

  get hasSelectedItems(): boolean {
    const hasSelected = this.promotions.some(p => p.selected);
    console.log('Has selected items:', hasSelected); // Debug
    return hasSelected;
  }

  loadPromotions() {
    this._service.getCombinedData().subscribe({
      next: (data) => {
        console.log("✅ Dữ liệu nhận từ API:", data);

        data.categories.forEach((cat: any) => {
          this.categories[cat.CategoryID] = cat.CategoryName;
        });

        const promotionStatusMap = new Map<number, string>();
        data.promotionStatuses.forEach((status: any) => {
          promotionStatusMap.set(status.PromotionConditionID, status.PromotionStatus);
        });

        const voucherStatusMap = new Map<number, string>();
        data.voucherStatuses.forEach((status: any) => {
          voucherStatusMap.set(status.VoucherConditionID, status.VoucherStatus);
        });

        const promotionItems = data.promotions.map((promo: any) => {
          const startDate = new Date(promo.PromotionStartDate);
          const endDate = new Date(promo.PromotionExpiredDate);
          const today = new Date();
          let status = 'Sắp diễn ra';
          if (today >= startDate && today <= endDate) {
            status = 'Đang diễn ra';
          } else if (today > endDate) {
            status = 'Hết hạn';
          }

          const applicableScope = promo.ApplicableScope;
          let applicableScopeDisplay = 'Toàn ngành hàng';
          if (Array.isArray(applicableScope)) {
            applicableScopeDisplay = applicableScope
              .map(catId => this.categories[catId] || catId)
              .join(', ');
          }

          return {
            _id: promo._id,
            type: 'promotion' as const,
            id: promo.PromotionID,
            startDate: promo.PromotionStartDate,
            endDate: promo.PromotionExpiredDate,
            conditionId: promo.PromotionConditionID,
            conditionStatus: promotionStatusMap.get(promo.PromotionConditionID) || 'Không xác định',
            quantity: undefined,
            remainingQuantity: undefined,
            value: promo.PromotionValue,
            status: status,
            selected: false,
            applicableScope: promo.ApplicableScope,
            applicableScopeDisplay: applicableScopeDisplay
          };
        });

        const voucherItems = data.vouchers.map((voucher: any) => {
          const startDate = new Date(voucher.VoucherStartDate);
          const endDate = new Date(voucher.VoucherExpiredDate);
          const today = new Date();
          let status = 'Sắp diễn ra';
          if (today >= startDate && today <= endDate) {
            status = 'Đang diễn ra';
          } else if (today > endDate || (voucher.RemainingQuantity === 0)) {
            status = 'Hết hạn';
          }

          const applicableScope = voucher.ApplicableScope;
          let applicableScopeDisplay = 'Toàn ngành hàng';
          if (Array.isArray(applicableScope)) {
            applicableScopeDisplay = applicableScope
              .map(catId => this.categories[catId] || catId)
              .join(', ');
          }

          return {
            _id: voucher._id,
            type: 'voucher' as const,
            id: voucher.VoucherID,
            startDate: voucher.VoucherStartDate,
            endDate: voucher.VoucherExpiredDate,
            conditionId: voucher.VoucherConditionID,
            conditionStatus: voucherStatusMap.get(voucher.VoucherConditionID) || 'Không xác định',
            quantity: voucher.VoucherQuantity,
            remainingQuantity: voucher.RemainingQuantity,
            value: voucher.VoucherValue,
            status: status,
            selected: false,
            applicableScope: voucher.ApplicableScope,
            applicableScopeDisplay: applicableScopeDisplay
          };
        });

        this.promotions = [...promotionItems, ...voucherItems];
        this.filteredPromotions = [...this.promotions];
        this.updatePagination();
      },
      error: (err) => {
        console.error("❌ Lỗi khi gọi API:", err);
        this.errMessage = err.message || 'Lỗi khi tải danh sách khuyến mãi. Vui lòng kiểm tra API!';
      },
    });
>>>>>>> feature_quanlykhuyenmai
  }

  changePage(role: string) {
    this.currentRole = role;
  }

  toggleSelectAll() {
    this.selectAllChecked = !this.selectAllChecked;
<<<<<<< HEAD
    this.filteredPromos.forEach(promo => promo.selected = this.selectAllChecked);
  }

  updateSelectAllStatus() {
    this.selectAllChecked = this.filteredPromos.every(promo => promo.selected);
  }

  togglePromoSelection(promo: Promotion) {
    promo.selected = !promo.selected;
=======
    this.pagedPromotions.forEach((promotion) => (promotion.selected = this.selectAllChecked));
  }

  updateSelectAllStatus() {
    this.selectAllChecked = this.pagedPromotions.every((promotion) => promotion.selected);
  }

  togglePromoSelection(promotion: Promotion) {
    promotion.selected = !promotion.selected;
>>>>>>> feature_quanlykhuyenmai
    this.updateSelectAllStatus();
  }

  openCreatePromotion() {
<<<<<<< HEAD
    try {
      const url = this.router.serializeUrl(this.router.createUrlTree(['/khuyenmai-create']));
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening create promotion page:', error);
    }
  }

  goToPromotionDetail(promotion: Promotion) {
    try {
      const url = this.router.serializeUrl(this.router.createUrlTree(['/khuyenmai-detail', promotion.id]));
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening promotion detail page:', error);
    }
=======
    const url = this.router.serializeUrl(this.router.createUrlTree(['/khuyenmai-create']));
    window.open(url, '_blank');
  }

  goToPromotionDetail(promotion: Promotion) {
    const promoId = promotion._id;
    const promoType = promotion.type;

    // Kiểm tra promoId và promoType trước khi điều hướng
    if (!promoId || !promoType) {
      console.error("❌ Thiếu promoId hoặc promoType:", { promoId, promoType });
      this.errMessage = "Không thể mở chi tiết khuyến mãi. Thiếu thông tin ID hoặc loại.";
      return;
    }

    console.log("Điều hướng tới:", `/khuyenmai-detail/${promoId}/${promoType}`);
    const url = this.router.serializeUrl(this.router.createUrlTree(['/khuyenmai-detail', promoId, promoType]));
    window.open(url, '_blank'); // Mở trang mới
  }

  goToCreate() {
    this.router.navigate(['/khuyenmai-create']);
  }

  deletePromotion() {
    if (this.promotionToDelete) {
      const promoId = this.promotionToDelete._id;
      const type = this.promotionToDelete.type;
      this._service.deleteItem(promoId, type).subscribe({
        next: (response) => {
          console.log("✅ Xóa thành công:", response);
          this.promotions = this.promotions.filter(p => p._id !== promoId);
          this.filteredPromotions = this.filteredPromotions.filter(p => p._id !== promoId);
          this.updatePagination();
          alert(`${type === 'promotion' ? 'Promotion' : 'Voucher'} đã được xóa thành công.`);
          this.closeDeletePopup();
        },
        error: (err) => {
          console.error("❌ Lỗi khi xóa:", err);
          this.errMessage = err.message || `Lỗi khi xóa ${type === 'promotion' ? 'promotion' : 'voucher'}.`;
          this.closeDeletePopup();
        }
      });
    }
  }

  confirmBulkDelete() {
    this.isBulkDeletePopupVisible = true;
  }

  closeBulkDeletePopup() {
    this.isBulkDeletePopupVisible = false;
  }

  bulkDelete() {
    const selectedItems = this.promotions.filter(p => p.selected);
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một mục để xóa.');
      return;
    }

    const deleteRequests = selectedItems.map(item =>
      this._service.deleteItem(item._id, item.type).toPromise()
    );

    Promise.all(deleteRequests)
      .then(() => {
        console.log("✅ Xóa nhiều mục thành công");
        this.promotions = this.promotions.filter(p => !p.selected);
        this.filteredPromotions = this.filteredPromotions.filter(p => !p.selected);
        this.updatePagination();
        alert('Đã xóa các mục được chọn thành công.');
        this.closeBulkDeletePopup();
      })
      .catch(err => {
        console.error("❌ Lỗi khi xóa nhiều mục:", err);
        this.errMessage = err.message || 'Lỗi khi xóa nhiều mục.';
        this.closeBulkDeletePopup();
      });
  }

  confirmBulkEnd() {
    this.isBulkEndPopupVisible = true;
  }

  closeBulkEndPopup() {
    this.isBulkEndPopupVisible = false;
  }

  bulkEnd() {
    const selectedItems = this.promotions.filter(p => p.selected);
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một mục để kết thúc sớm.');
      return;
    }

    const endRequests = selectedItems.map(item =>
      this._service.endItem(item._id, item.type).toPromise()
    );

    Promise.all(endRequests)
      .then(() => {
        console.log("✅ Kết thúc sớm nhiều mục thành công");
        const today = new Date();
        this.promotions = this.promotions.map(p => {
          if (p.selected) {
            return { ...p, endDate: today.toISOString(), status: 'Hết hạn', selected: false };
          }
          return p;
        });
        this.filteredPromotions = [...this.promotions];
        this.updatePagination();
        alert('Đã kết thúc sớm các mục được chọn.');
        this.closeBulkEndPopup();
      })
      .catch(err => {
        console.error("❌ Lỗi khi kết thúc sớm nhiều mục:", err);
        this.errMessage = err.message || 'Lỗi khi kết thúc sớm nhiều mục.';
        this.closeBulkEndPopup();
      });
>>>>>>> feature_quanlykhuyenmai
  }

  confirmDelete(promotion: Promotion) {
    this.promotionToDelete = promotion;
    this.isDeletePopupVisible = true;
  }

<<<<<<< HEAD
  deletePromotion() {
    if (this.promotionToDelete) {
      this.promos = this.promos.filter(p => p.id !== this.promotionToDelete!.id);
      this.filteredPromos = this.filteredPromos.filter(p => p.id !== this.promotionToDelete!.id);
      alert('Khuyến mãi đã được xóa.');
    }
    this.closeDeletePopup();
  }

=======
>>>>>>> feature_quanlykhuyenmai
  closeDeletePopup() {
    this.isDeletePopupVisible = false;
    this.promotionToDelete = null;
  }

  applyFilter() {
<<<<<<< HEAD
    this.filteredPromos = this.promos.filter(promo => {
      if (this.filterCondition) {
        const condition = this.filterCondition.toLowerCase();
        if (condition.includes('từ ngày')) {
          const startDate = new Date(condition.split('từ ngày')[1].trim());
          return new Date(promo.startDate!) >= startDate;
        } else if (condition.includes('đến ngày')) {
          const endDate = new Date(condition.split('đến ngày')[1].trim());
          return new Date(promo.endDate!) <= endDate;
        } else if (condition.includes('đang khuyến mãi')) {
          return promo.status.toLowerCase() === 'đang khuyến mãi';
        }
      }
      return true;
    });
    this.updateSelectAllStatus();
  }

  search() {
    this.applyFilter();
    if (this.searchKeyword) {
      const keyword = this.searchKeyword.toLowerCase();
      this.filteredPromos = this.filteredPromos.filter(promo =>
        promo.name.toLowerCase().includes(keyword) ||
        promo.code.toLowerCase().includes(keyword)
      );
    }
    this.updateSelectAllStatus();
  }
}
=======
    this.filteredPromotions = [...this.promotions];
    
    if (this.filterType !== 'all') {
      this.filteredPromotions = this.filteredPromotions.filter(
        (promo) => promo.type === this.filterType
      );
    }

    if (this.filterStatus) {
      this.filteredPromotions = this.filteredPromotions.filter(
        (promo) => promo.status.toLowerCase() === this.filterStatus.toLowerCase()
      );
    }

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
      }
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  search() {
    console.log('Tìm kiếm với từ khóa:', this.searchKeyword);
    this.applyFilter();
    if (this.searchKeyword) {
      const keyword = this.searchKeyword.toLowerCase();
      console.log('Danh sách trước khi lọc:', this.filteredPromotions);
      this.filteredPromotions = this.filteredPromotions.filter(
        (promo) =>
          promo.id.toLowerCase().includes(keyword)
      );
      console.log('Danh sách sau khi lọc:', this.filteredPromotions);
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredPromotions.length / this.displayQuantity);
    const startIndex = (this.currentPage - 1) * this.displayQuantity;
    const endIndex = startIndex + this.displayQuantity;
    this.pagedPromotions = this.filteredPromotions.slice(startIndex, endIndex);
    this.updateSelectAllStatus();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
}
>>>>>>> feature_quanlykhuyenmai
