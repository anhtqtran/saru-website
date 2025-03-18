import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionApiService } from '../services/promotion-api.service';

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
  SCOPEID: number;
  ScopeName?: string;
}

interface PromotionScope {
  SCOPEID: number;
  SCOPE: string;
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
  promotionScopes: PromotionScope[] = [];
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
    this.isCancelPopupVisible = false;
    this.loadCombinedData();
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
            SCOPEID: item.SCOPEID !== undefined ? Number(item.SCOPEID) : 0,
            ScopeName: item.ScopeName || 'Toàn ngành hàng'
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

  loadCombinedData() {
    this._service.getCombinedData().subscribe({
      next: (data) => {
        console.log('Dữ liệu từ service:', data); // Log dữ liệu từ service
        if (data.promotionScopes && Array.isArray(data.promotionScopes)) {
          this.promotionScopes = [...data.promotionScopes]; // Sao chép trực tiếp dữ liệu từ service
          console.log('Danh sách scopes sau khi xử lý:', this.promotionScopes); // Log để kiểm tra
          this.updateScopeName();
        } else {
          this.errMessage = 'Danh sách phạm vi áp dụng không hợp lệ.';
          this.promotionScopes = [{ SCOPEID: 0, SCOPE: 'Toàn ngành hàng' }];
        }
      },
      error: (err) => {
        console.error('❌ Lỗi khi load combined data:', err);
        this.errMessage = 'Không thể tải danh sách phạm vi áp dụng.';
        this.promotionScopes = [{ SCOPEID: 0, SCOPE: 'Toàn ngành hàng' }];
      }
    });
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
        SCOPEID: this.promotion.SCOPEID
      }),
      ...(this.promotion.type === 'voucher' && {
        VoucherID: this.promotion.id,
        VoucherStartDate: this.promotion.startDate,
        VoucherExpiredDate: this.promotion.endDate,
        VoucherConditionID: this.promotion.conditionId,
        VoucherQuantity: this.promotion.quantity,
        VoucherValue: this.promotion.value,
        RemainingQuantity: this.promotion.remainingQuantity,
        SCOPEID: this.promotion.SCOPEID
      })
    };

    this._service.updateItem(this.promotion._id, this.promotion.type, updateData).subscribe({
      next: (response) => {
        console.log('✅ Cập nhật thành công:', response);
        this.successMessage = 'Cập nhật thành công!';
        this.errMessage = '';
        this.editMode = false;
        this.loadPromotionDetail(this.promotion?._id ?? '', this.promotion?.type ?? 'promotion');
      },
      error: (err) => {
        console.error('❌ Lỗi khi cập nhật:', err);
        this.errMessage = `Lỗi khi cập nhật: ${err.message}`;
        this.successMessage = '';
      }
    });
  }

  cancelEdit() {
    this.showCancelPopup();
  }

  cancel() {
    if (this.editMode) {
      this.showCancelPopup();
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

  showCancelPopup() {
    this.isCancelPopupVisible = true;
  }

  closeCancelPopup() {
    this.isCancelPopupVisible = false;
  }

  confirmCancel() {
    this.isCancelPopupVisible = false;
    if (this.editMode) {
      this.editMode = false;
      const id = this.route.snapshot.paramMap.get('id');
      const type = this.route.snapshot.paramMap.get('type') as 'promotion' | 'voucher';
      if (id && type) {
        this.loadPromotionDetail(id, type);
      }
    } else {
      this.router.navigate(['/']);
    }
    this.errMessage = '';
    this.successMessage = '';
    this.validationErrors = [];
  }

  updateScopeName() {
    if (this.promotion) {
      const scope = this.promotionScopes.find(s => s.SCOPEID === this.promotion!.SCOPEID);
      this.promotion.ScopeName = scope ? scope.SCOPE : 'Toàn ngành hàng';
    }
  }
}