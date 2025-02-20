import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-newpass',
  standalone: false,
  templateUrl: './newpass.component.html',
  styleUrls: ['./newpass.component.css']
})
export class NewpassComponent implements OnInit {
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
    });
  }

  ngOnInit(): void {
    // Không cần khởi tạo lại form ở đây vì đã khởi tạo trong constructor
  }

  passwordMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const newPassword = formGroup.get('newPassword')?.value || '';
    const newPasswordConfirm = formGroup.get('newPasswordConfirm')?.value || '';
    return newPassword === newPasswordConfirm ? null : { notMatching: true };
  }

  redirectToSuccess() {
    // Chuyển hướng đến trang thành công
    this.router.navigate(['/successresetpass']); // Đảm bảo rằng bạn đã định nghĩa route này trong routing module
  }
    
  passwordVisibility: { [key: string]: boolean } = {
    newPassword: false,
    newPasswordConfirm: false
  };

  togglePasswordVisibility(field: 'newPassword' | 'newPasswordConfirm') {
    this.passwordVisibility[field] = !this.passwordVisibility[field];
  }

  onCreatePasswordSubmit(): void {
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
  }

  getErrorMessage(field: string, errors: any): string {
    if (errors?.['required']) {
      return `${this.getFieldName(field)} là bắt buộc`;
    }

    if (errors?.['minlength']) {
      return `${this.getFieldName(field)} phải có ít nhất ${errors.minlength.requiredLength} ký tự.`;
    }
    if (field === 'newPasswordConfirm' && this.createPasswordForm?.errors?.['notMatching']) {
      return "Mật khẩu không khớp"; 
    }
    return '';
  }

  getFieldName(field: string): string {
    const fieldMap: { [key: string]: string } = {
      newPassword: 'Tạo Mật khẩu',
      newPasswordConfirm: 'Xác nhận Mật khẩu mới'
    };
    return fieldMap[field] || field;
  }
}