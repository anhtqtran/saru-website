import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionApiService } from '../services/promotion-api.service';
import { Router } from '@angular/router';

interface Promotion {
  _id?: string;
  type: 'promotion' | 'voucher';
  id: string;
  startDate: string;
  endDate: string;
  conditionId: number;
  conditionStatus: string;
  quantity?: number;
  remainingQuantity?: number;
  value: number;
  limitPerUser?: number;
  status: string;
  SCOPEID: number;
  ScopeName?: string;
}

interface PromotionScope {
  SCOPEID: number;
  SCOPE: string;
}

@Component({
  selector: 'app-khuyenmai-create',
  templateUrl: './khuyenmai-create.component.html',
  styleUrls: ['./khuyenmai-create.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class KhuyenmaiCreateComponent implements OnInit {
  promotion: Promotion = {
    type: 'promotion',
    id: '',
    startDate: '',
    endDate: '',
    conditionId: 0,
    conditionStatus: '',
    value: 0,
    status: '',
    SCOPEID: 0,
    ScopeName: 'Toàn ngành hàng',
    quantity: undefined,
    remainingQuantity: undefined,
    limitPerUser: 0,
  };
  errMessage: string = '';
  successMessage: string = '';
  promotionScopes: PromotionScope[] = [];
  isSubmitting: boolean = false;
  isCancelPopupVisible: boolean = false;

  constructor(
    private _service: PromotionApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPromotionScopes();
    this.isCancelPopupVisible = false;
  }

  loadPromotionScopes() {
    this._service.getCombinedData().subscribe({
      next: (data) => {
        if (data.promotionScopes && Array.isArray(data.promotionScopes)) {
          this.promotionScopes = data.promotionScopes.map((scope: any) => ({
            SCOPEID: Number(scope.SCOPEID),
            SCOPE: scope.SCOPE || 'Toàn ngành hàng'
          }));
          this.updateScopeName();
        }
      },
      error: (err) => {
        console.error('❌ Lỗi khi load promotion scopes:', err);
        this.errMessage = 'Không thể tải danh sách phạm vi áp dụng.';
      }
    });
  }

  updateScopeName() {
    const scope = this.promotionScopes.find(s => s.SCOPEID === this.promotion.SCOPEID);
    this.promotion.ScopeName = scope ? scope.SCOPE : 'Toàn ngành hàng';
  }

  onSubmit() {
    if (!this.validateForm()) {
      this.errMessage = 'Vui lòng sửa các lỗi sau trước khi lưu:';
      return;
    }

    this.isSubmitting = true;
    const newPromotion = {
      ...(this.promotion.type === 'promotion' && {
        PromotionID: this.promotion.id,
        PromotionStartDate: this.promotion.startDate,
        PromotionExpiredDate: this.promotion.endDate,
        PromotionConditionID: this.promotion.conditionId,
        PromotionValue: this.promotion.value,
        SCOPEID: this.promotion.SCOPEID,
        LimitPerUser: this.promotion.limitPerUser || 0,
      }),
      ...(this.promotion.type === 'voucher' && {
        VoucherID: this.promotion.id,
        VoucherStartDate: this.promotion.startDate,
        VoucherExpiredDate: this.promotion.endDate,
        VoucherConditionID: this.promotion.conditionId,
        VoucherQuantity: this.promotion.quantity,
        VoucherValue: this.promotion.value,
        RemainingQuantity: this.promotion.remainingQuantity ?? this.promotion.quantity,
        SCOPEID: this.promotion.SCOPEID,
        LimitPerUser: this.promotion.limitPerUser || 0,
      })
    };

    const url = this.promotion.type === 'promotion' ? '/promotions' : '/vouchers';
    this._service.createItem(url, newPromotion).subscribe({
      next: (response) => {
        console.log('✅ Tạo mới thành công:', response);
        this.successMessage = 'Tạo mới thành công!';
        this.errMessage = '';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err) => {
        console.error('❌ Lỗi khi tạo mới:', err);
        this.errMessage = `Lỗi khi tạo mới: ${err.message}`;
        this.successMessage = '';
        this.isSubmitting = false;
      }
    });
  }

  validateForm(): boolean {
    const errors: string[] = [];

    if (!this.promotion.id) {
      errors.push('Mã khuyến mãi không được để trống.');
    }

    if (!this.promotion.startDate) {
      errors.push('Ngày bắt đầu không được để trống.');
    }

    if (!this.promotion.endDate) {
      errors.push('Ngày kết thúc không được để trống.');
    }

    if (!this.promotion.value || this.promotion.value <= 0) {
      errors.push('Giá trị khuyến mãi phải lớn hơn 0.');
    }

    if (this.promotion.type === 'voucher') {
      if (!this.promotion.quantity || this.promotion.quantity <= 0) {
        errors.push('Số lượng voucher phải lớn hơn 0.');
      }
      if (this.promotion.remainingQuantity && this.promotion.remainingQuantity < 0) {
        errors.push('Số lượng còn lại không được nhỏ hơn 0.');
      }
      if (this.promotion.remainingQuantity && this.promotion.quantity && this.promotion.remainingQuantity > this.promotion.quantity) {
        errors.push('Số lượng còn lại không được lớn hơn số lượng tổng.');
      }
    }

    if (this.promotion.limitPerUser !== undefined && this.promotion.limitPerUser < 0) {
      errors.push('Giới hạn mỗi người không được nhỏ hơn 0.');
    }

    const startDate = new Date(this.promotion.startDate);
    const endDate = new Date(this.promotion.endDate);
    if (startDate >= endDate) {
      errors.push('Ngày kết thúc phải sau ngày bắt đầu.');
    }

    if (errors.length > 0) {
      this.errMessage = errors.join('\n');
      return false;
    }

    this.errMessage = '';
    return true;
  }

  decreaseLimit() {
    if (this.promotion.limitPerUser && this.promotion.limitPerUser > 0) {
      this.promotion.limitPerUser--;
    }
  }

  increaseLimit() {
    if (this.promotion.limitPerUser !== undefined) {
      this.promotion.limitPerUser++;
    } else {
      this.promotion.limitPerUser = 1;
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
    this.router.navigate(['/']);
  }
}