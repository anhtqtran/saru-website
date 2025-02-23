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
    }
  }

  onSubmit() {
    console.log('Form submitted', this.promotion);
    // Implement your save logic here
  }
}
