import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  applicableScope: string[]; // Đảm bảo là mảng string
  applicableScopeDisplay?: string;
}

interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-khuyenmai-detail',
  templateUrl: './khuyenmai-detail.component.html',
  styleUrls: ['./khuyenmai-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class KhuyenmaiDetailComponent implements OnInit {
  promotion: Promotion | null = null;
  errMessage: string = '';
  successMessage: string = '';
  categories: { [key: string]: string } = {};
  categoryOptions: Category[] = []; // Danh sách tùy chọn cho listbox
  editMode: boolean = false;
  validationErrors: string[] = [];
  isCancelPopupVisible: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _service: PromotionApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const type = this.route.snapshot.paramMap.get('type') as 'promotion' | 'voucher';

    if (id && type) {
      this.loadPromotionDetail(id, type);
    } else {
      this.errMessage = 'Không tìm thấy ID hoặc loại khuyến mãi.';
    }
    this.isCancelPopupVisible = false; // Đảm bảo popup không hiển thị khi vừa vào
  }

  loadPromotionDetail(id: string, type: 'promotion' | 'voucher') {
    this._service.getItemById(id, type).subscribe({
      next: (item) => {
        if (item) {
          const rawStartDate = item.PromotionStartDate || item.VoucherStartDate || '';
          const rawEndDate = item.PromotionExpiredDate || item.VoucherExpiredDate || '';

          const startDate = new Date(rawStartDate);
          const endDate = new Date(rawEndDate);

          this.promotion = {
            _id: item._id,
            type: type,
            id: item.PromotionID || item.VoucherID || '',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            conditionId: item.PromotionConditionID || item.VoucherConditionID || 0,
            conditionStatus: '',
            quantity: type === 'voucher' ? item.VoucherQuantity || 0 : undefined,
            remainingQuantity: type === 'voucher' ? item.RemainingQuantity || 0 : undefined,
            value: item.PromotionValue || item.VoucherValue || 0,
            status: '',
            applicableScope: Array.isArray(item.ApplicableScope) ? item.ApplicableScope : item.ApplicableScope ? [item.ApplicableScope] : [],
            applicableScopeDisplay: item.ApplicableScope
              ? Array.isArray(item.ApplicableScope)
                ? item.ApplicableScope.join(', ')
                : item.ApplicableScope
              : 'Toàn ngành hàng'
          };

          const today = new Date();
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            this.promotion.status = 'Hết hạn';
          } else {
            if (today >= startDate && today <= endDate) {
              this.promotion.status = 'Đang diễn ra';
            } else if (today > endDate) {
              this.promotion.status = 'Hết hạn';
            } else {
              this.promotion.status = 'Sắp diễn ra';
            }
          }

          this.loadCategories();
        } else {
          this.errMessage = `Không tìm thấy khuyến mãi với ID ${id} và loại ${type}.`;
        }
      },
      error: (err) => {
        console.error('❌ Lỗi khi load chi tiết:', err);
        this.errMessage = `Không thể load chi tiết. Lỗi: ${err.message}`;
      }
    });
  }

  loadCategories() {
    this._service.getCombinedData().subscribe({
      next: (data) => {
        if (data.categories && Array.isArray(data.categories)) {
          this.categoryOptions = data.categories.map((cat: any) => ({
            id: cat.CategoryID,
            name: cat.CategoryName
          }));
          if (Array.isArray(this.promotion?.applicableScope)) {
            this.promotion.applicableScopeDisplay = this.promotion.applicableScope
              .map(catId => this.categoryOptions.find(cat => cat.id === catId)?.name || catId)
              .join(', ');
          }
        }
      },
      error: (err) => {
        console.error('❌ Lỗi khi load categories:', err);
        this.errMessage = 'Không thể tải danh mục áp dụng.';
      }
    });
  }

  // Kiểm tra xem danh mục đã được chọn chưa
  isCategorySelected(categoryId: string): boolean {
    return this.promotion?.applicableScope?.includes(categoryId) || false;
  }

  // Cập nhật applicableScopeDisplay khi thay đổi chọn trong listbox
  updateApplicableScopeDisplay() {
    if (this.promotion?.applicableScope) {
      this.promotion.applicableScopeDisplay = this.promotion.applicableScope
        .map(catId => this.categoryOptions.find(cat => cat.id === catId)?.name || catId)
        .join(', ');
    }
  }

  enableEditMode() {
    this.editMode = true;
    this.errMessage = '';
    this.successMessage = '';
    this.validationErrors = [];
  }

  validateForm(): boolean {
    this.validationErrors = [];

    if (!this.promotion) return false;

    if (!this.promotion.id) {
      this.validationErrors.push('Mã khuyến mãi không được để trống.');
    }

    if (!this.promotion.startDate) {
      this.validationErrors.push('Ngày bắt đầu không được để trống.');
    }

    if (!this.promotion.endDate) {
      this.validationErrors.push('Ngày kết thúc không được để trống.');
    }

    if (!this.promotion.value || this.promotion.value <= 0) {
      this.validationErrors.push('Giá trị khuyến mãi phải lớn hơn 0.');
    }

    if (this.promotion.type === 'voucher') {
      if (!this.promotion.quantity || this.promotion.quantity <= 0) {
        this.validationErrors.push('Số lượng voucher phải lớn hơn 0.');
      }
      if (!this.promotion.remainingQuantity || this.promotion.remainingQuantity < 0) {
        this.validationErrors.push('Số lượng còn lại không được nhỏ hơn 0.');
      }
      if (this.promotion.remainingQuantity && this.promotion.quantity && this.promotion.remainingQuantity > this.promotion.quantity) {
        this.validationErrors.push('Số lượng còn lại không được lớn hơn số lượng tổng.');
      }
    }

    const startDate = new Date(this.promotion.startDate);
    const endDate = new Date(this.promotion.endDate);
    if (startDate >= endDate) {
      this.validationErrors.push('Ngày kết thúc phải sau ngày bắt đầu.');
    }

    return this.validationErrors.length === 0;
  }

  saveChanges() {
    if (!this.promotion) return;

    if (!this.validateForm()) {
      this.errMessage = 'Vui lòng sửa các lỗi sau trước khi lưu:';
      return;
    }

    const updateData = {
      ...(this.promotion.type === 'promotion' && {
        PromotionID: this.promotion.id,
        PromotionStartDate: this.promotion.startDate,
        PromotionExpiredDate: this.promotion.endDate,
        PromotionConditionID: this.promotion.conditionId,
        PromotionValue: this.promotion.value,
        ApplicableScope: this.promotion.applicableScope || []
      }),
      ...(this.promotion.type === 'voucher' && {
        VoucherID: this.promotion.id,
        VoucherStartDate: this.promotion.startDate,
        VoucherExpiredDate: this.promotion.endDate,
        VoucherConditionID: this.promotion.conditionId,
        VoucherQuantity: this.promotion.quantity,
        VoucherValue: this.promotion.value,
        RemainingQuantity: this.promotion.remainingQuantity,
        ApplicableScope: this.promotion.applicableScope || []
      })
    };

    this._service.updateItem(this.promotion._id, this.promotion.type, updateData).subscribe({
      next: (response) => {
        console.log('✅ Cập nhật thành công:', response);
        this.successMessage = 'Cập nhật thành công!';
        this.errMessage = '';
        this.editMode = false;
        this.loadPromotionDetail(this.promotion?._id ?? '', this.promotion?.type ?? 'promotion'); // Tải lại dữ liệu
      },
      error: (err) => {
        console.error('❌ Lỗi khi cập nhật:', err);
        this.errMessage = `Lỗi khi cập nhật: ${err.message}`;
        this.successMessage = '';
      }
    });
  }

  cancelEdit() {
    this.showCancelPopup(); // Hiển thị popup xác nhận khi hủy chỉnh sửa
  }

  cancel() {
    if (this.editMode) {
      this.showCancelPopup(); // Hiển thị popup khi đang ở chế độ chỉnh sửa và nhấn "Quay lại"
    } else {
      this.router.navigate(['/']);
    }
  }

  endPromotion() {
    if (!this.promotion) return;

    if (this.promotion.status !== 'Đang diễn ra') {
      this.errMessage = 'Chỉ có thể kết thúc sớm các khuyến mãi đang diễn ra.';
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn kết thúc sớm ${this.promotion.type === 'promotion' ? 'promotion' : 'voucher'} ${this.promotion.id}?`)) {
      this._service.endItem(this.promotion._id, this.promotion.type).subscribe({
        next: (response) => {
          console.log('✅ Kết thúc sớm thành công:', response);
          this.successMessage = 'Đã kết thúc sớm thành công!';
          this.errMessage = '';
          this.promotion!.endDate = new Date().toISOString().split('T')[0];
          this.promotion!.status = 'Hết hạn';
        },
        error: (err) => {
          console.error('❌ Lỗi khi kết thúc sớm:', err);
          this.errMessage = `Lỗi khi kết thúc sớm: ${err.message}`;
          this.successMessage = '';
        }
      });
    }
  }

  // Phương thức để mở popup xác nhận hủy
  showCancelPopup() {
    this.isCancelPopupVisible = true;
  }

  // Phương thức để đóng popup hủy mà không thực hiện hủy
  closeCancelPopup() {
    this.isCancelPopupVisible = false;
  }

  // Phương thức để xác nhận hủy và thực hiện hành động
  confirmCancel() {
    this.isCancelPopupVisible = false;
    if (this.editMode) {
      this.editMode = false;
      const id = this.route.snapshot.paramMap.get('id');
      const type = this.route.snapshot.paramMap.get('type') as 'promotion' | 'voucher';
      if (id && type) {
        this.loadPromotionDetail(id, type); // Tải lại dữ liệu ban đầu
      }
    } else {
      this.router.navigate(['/']); // Quay lại danh sách
    }
    this.errMessage = '';
    this.successMessage = '';
    this.validationErrors = [];
  }
}