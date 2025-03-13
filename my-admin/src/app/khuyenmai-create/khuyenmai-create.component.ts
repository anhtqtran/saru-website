<<<<<<< HEAD
import { Component } from '@angular/core';

@Component({
  selector: 'app-khuyenmai-create',
  standalone: false,
  templateUrl: './khuyenmai-create.component.html',
  styleUrl: './khuyenmai-create.component.css'
})
export class KhuyenmaiCreateComponent {
  promotion = {
    name: '',
    code: '',
    startDate: '',
    endDate: '',
    discountType: '',
    minAmount: null,
    discountAmount: null,
    quantity: null,
    targetAmount: null,
    limitPerUser: 3
  };

  isCancelPopupVisible = false;

  showCancelPopup() {
    this.isCancelPopupVisible = true;
  }

  closeCancelPopup() {
    this.isCancelPopupVisible = false;
  }

  confirmCancel() {
    this.resetForm();
    this.closeCancelPopup();
  }

  resetForm() {
    this.promotion = {
      name: '',
      code: '',
      startDate: '',
      endDate: '',
      discountType: '',
      minAmount: null,
      discountAmount: null,
      quantity: null,
      targetAmount: null,
      limitPerUser: 3
    };
  }

  increaseLimit() {
    this.promotion.limitPerUser++;
  }

  decreaseLimit() {
    if (this.promotion.limitPerUser > 1) {
      this.promotion.limitPerUser--;
=======
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionApiService } from '../promotion-api.service';
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
  applicableScope: string[]; // Đảm bảo là mảng string
  applicableScopeDisplay?: string;
}

interface Category {
  id: string;
  name: string;
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
    applicableScope: [], // Khởi tạo là mảng rỗng
    applicableScopeDisplay: 'Toàn ngành hàng',
    quantity: undefined,
    remainingQuantity: undefined,
    limitPerUser: 0,
  };
  errMessage: string = '';
  successMessage: string = '';
  categories: { [key: string]: string } = {};
  categoryOptions: Category[] = []; // Danh sách tùy chọn cho listbox
  isSubmitting: boolean = false;
  isCancelPopupVisible: boolean = false; // Thêm biến để kiểm soát popup

  constructor(
    private _service: PromotionApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.isCancelPopupVisible = false; // Đảm bảo popup không hiển thị khi vừa vào trang
  }

  loadCategories() {
    this._service.getCombinedData().subscribe({
      next: (data) => {
        if (data.categories && Array.isArray(data.categories)) {
          this.categoryOptions = data.categories.map((cat: any) => ({
            id: cat.CategoryID,
            name: cat.CategoryName
          }));
          if (Array.isArray(this.promotion.applicableScope)) {
            this.updateApplicableScopeDisplay(); // Cập nhật hiển thị ban đầu
          }
        }
      },
      error: (err) => {
        console.error('❌ Lỗi khi load categories:', err);
        this.errMessage = 'Không thể tải danh mục áp dụng.';
      }
    });
  }

  // Cập nhật applicableScopeDisplay khi thay đổi chọn trong listbox
  updateApplicableScopeDisplay() {
    if (this.promotion.applicableScope && this.promotion.applicableScope.length === 0) {
      this.promotion.applicableScopeDisplay = 'Toàn ngành hàng';
    } else {
      this.promotion.applicableScopeDisplay = this.promotion.applicableScope
        .map(catId => this.categoryOptions.find(cat => cat.id === catId)?.name || catId)
        .join(', ');
>>>>>>> feature_quanlykhuyenmai
    }
  }

  onSubmit() {
<<<<<<< HEAD
    console.log('Form submitted', this.promotion);
    // Implement your save logic here
  }
}
=======
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
        ApplicableScope: this.promotion.applicableScope || [],
        LimitPerUser: this.promotion.limitPerUser || 0,
      }),
      ...(this.promotion.type === 'voucher' && {
        VoucherID: this.promotion.id,
        VoucherStartDate: this.promotion.startDate,
        VoucherExpiredDate: this.promotion.endDate,
        VoucherConditionID: this.promotion.conditionId,
        VoucherQuantity: this.promotion.quantity,
        VoucherValue: this.promotion.value,
        RemainingQuantity: this.promotion.remainingQuantity,
        ApplicableScope: this.promotion.applicableScope || [],
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

  // Giảm giới hạn mỗi người
  decreaseLimit() {
    if (this.promotion.limitPerUser && this.promotion.limitPerUser > 0) {
      this.promotion.limitPerUser--;
    }
  }

  // Tăng giới hạn mỗi người
  increaseLimit() {
    if (this.promotion.limitPerUser !== undefined) {
      this.promotion.limitPerUser++;
    } else {
      this.promotion.limitPerUser = 1;
    }
  }

  // Mở popup xác nhận hủy
  showCancelPopup() {
    this.isCancelPopupVisible = true;
  }

  // Đóng popup hủy mà không thực hiện hủy
  closeCancelPopup() {
    this.isCancelPopupVisible = false;
  }

  // Xác nhận hủy và điều hướng về trang danh sách
  confirmCancel() {
    this.isCancelPopupVisible = false;
    this.router.navigate(['/']);
  }
}
>>>>>>> feature_quanlykhuyenmai
