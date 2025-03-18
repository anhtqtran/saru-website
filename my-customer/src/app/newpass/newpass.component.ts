import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
<<<<<<< HEAD
=======
import { AuthService } from '../services/auth.service';
>>>>>>> main
import { Router } from '@angular/router';

@Component({
  selector: 'app-newpass',
  standalone: false,
  templateUrl: './newpass.component.html',
  styleUrls: ['./newpass.component.css']
})
export class NewpassComponent implements OnInit {
<<<<<<< HEAD
hidePopup() {
throw new Error('Method not implemented.');
}
  createPasswordForm: FormGroup;
  email: string = 'example@email.com';
  
  constructor(private router: Router, private fb: FormBuilder) {
    this.createPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPasswordConfirm: ['', [Validators.required]],
    }, {
      validators: (form) => this.passwordMatchValidator(form as FormGroup)
=======
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
>>>>>>> main
    });
  }

  ngOnInit(): void {
<<<<<<< HEAD
    // Không cần khởi tạo lại form ở đây vì đã khởi tạo trong constructor
=======
    // Lấy email từ state của router
    this.email = history.state['email'] || '';
    if (!this.email) {
      this.router.navigate(['/resetpass']); // Quay lại nếu không có email
    }
>>>>>>> main
  }

  passwordMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const newPassword = formGroup.get('newPassword')?.value || '';
    const newPasswordConfirm = formGroup.get('newPasswordConfirm')?.value || '';
    return newPassword === newPasswordConfirm ? null : { notMatching: true };
  }

<<<<<<< HEAD
  redirectToSuccess() {
    // Chuyển hướng đến trang thành công
    this.router.navigate(['/successresetpass']); // Đảm bảo rằng bạn đã định nghĩa route này trong routing module
  }
    
  passwordVisibility: { [key: string]: boolean } = {
    newPassword: false,
    newPasswordConfirm: false
  };

=======
>>>>>>> main
  togglePasswordVisibility(field: 'newPassword' | 'newPasswordConfirm') {
    this.passwordVisibility[field] = !this.passwordVisibility[field];
  }

  onCreatePasswordSubmit(): void {
<<<<<<< HEAD
    if (this.createPasswordForm?.invalid) {
      this.createPasswordForm.markAllAsTouched(); // Đánh dấu tất cả các trường là đã được chạm
      return;
    }
    
    // Nếu form hợp lệ, thực hiện hành động cần thiết
    console.log('Tạo Mật khẩu mới thành công:', this.createPasswordForm.value);
    
    // Gọi phương thức redirectToSuccess để chuyển hướng
    this.redirectToSuccess();
    
    // Reset form sau khi thành công
    this.createPasswordForm?.reset();
=======
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
>>>>>>> main
  }

  getErrorMessage(field: string, errors: any): string {
    if (errors?.['required']) {
      return `${this.getFieldName(field)} là bắt buộc`;
    }
<<<<<<< HEAD

    if (errors?.['minlength']) {
      return `${this.getFieldName(field)} phải có ít nhất ${errors.minlength.requiredLength} ký tự.`;
    }
    if (field === 'newPasswordConfirm' && this.createPasswordForm?.errors?.['notMatching']) {
      return "Mật khẩu không khớp"; 
    }
=======
    if (errors?.['minlength']) {
      return `${this.getFieldName(field)} phải có ít nhất ${errors.minlength.requiredLength} ký tự.`;
    }
>>>>>>> main
    return '';
  }

  getFieldName(field: string): string {
    const fieldMap: { [key: string]: string } = {
<<<<<<< HEAD
      newPassword: 'Tạo Mật khẩu',
      newPasswordConfirm: 'Xác nhận Mật khẩu mới'
    };
    return fieldMap[field] || field;
  }
=======
      newPassword: 'Mật khẩu mới',
      newPasswordConfirm: 'Xác nhận mật khẩu'
    };
    return fieldMap[field] || field;
  }

  hidePopup() {
    this.router.navigate(['/login']);
  }
>>>>>>> main
}