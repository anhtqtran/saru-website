import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-newpass',
  standalone: false,
  templateUrl: './newpass.component.html',
  styleUrls: ['./newpass.component.css']
})
export class NewpassComponent implements OnInit {
  createPasswordForm: FormGroup;
  email: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  passwordVisibility: { [key: string]: boolean } = {
    newPassword: false,
    newPasswordConfirm: false
  };

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.createPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPasswordConfirm: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });
  }

  ngOnInit(): void {
    // Lấy email từ state của router
    this.email = history.state['email'] || '';
    if (!this.email) {
      this.router.navigate(['/resetpass']); // Quay lại nếu không có email
    }
  }

  passwordMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const newPassword = formGroup.get('newPassword')?.value || '';
    const newPasswordConfirm = formGroup.get('newPasswordConfirm')?.value || '';
    return newPassword === newPasswordConfirm ? null : { notMatching: true };
  }

  togglePasswordVisibility(field: 'newPassword' | 'newPasswordConfirm') {
    this.passwordVisibility[field] = !this.passwordVisibility[field];
  }

  onCreatePasswordSubmit(): void {
    if (this.createPasswordForm.invalid) {
      this.createPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const { newPassword } = this.createPasswordForm.value;
    this.authService.resetPassword(this.email, newPassword).subscribe({
      next: (response) => {
        console.log('Đặt lại mật khẩu thành công:', response);
        this.isLoading = false;
        this.router.navigate(['/successresetpass']); // Chuyển hướng sau khi thành công
      },
      error: (error) => {
        console.error('Đặt lại mật khẩu thất bại:', error);
        this.isLoading = false;
        this.errorMessage = error.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
      }
    });
  }

  getErrorMessage(field: string, errors: any): string {
    if (errors?.['required']) {
      return `${this.getFieldName(field)} là bắt buộc`;
    }
    if (errors?.['minlength']) {
      return `${this.getFieldName(field)} phải có ít nhất ${errors.minlength.requiredLength} ký tự.`;
    }
    return '';
  }

  getFieldName(field: string): string {
    const fieldMap: { [key: string]: string } = {
      newPassword: 'Mật khẩu mới',
      newPasswordConfirm: 'Xác nhận mật khẩu'
    };
    return fieldMap[field] || field;
  }

  hidePopup() {
    this.router.navigate(['/login']);
  }
}