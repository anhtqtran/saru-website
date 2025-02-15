import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSignUpMode: boolean = false;

  loginForm: FormGroup;
  signUpForm: FormGroup;
  passwordVisibility = {
    loginPassword: false,
    signUpPassword: false,
    passwordConfirm: false,
  };

  constructor(private fb: FormBuilder) {
    // Form Đăng Nhập
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [false],
    });

    // Form Đăng Ký
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', [Validators.required]],
      subscribe: [false],
    }, {
      validators: (form) => this.passwordMatchValidator(form as FormGroup)
    });
    
  }

  toggleSignUpMode() {
    this.isSignUpMode = !this.isSignUpMode;
    
    if (this.loginForm.dirty) {
      this.loginForm.reset();
    }
    if (this.signUpForm.dirty) {
      this.signUpForm.reset();
    }
  }

  togglePasswordVisibility(field: 'loginPassword' | 'signUpPassword' | 'passwordConfirm') {
    this.passwordVisibility[field] = !this.passwordVisibility[field];
  }

  passwordMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const password = formGroup.get('password')?.value || '';
    const confirmPassword = formGroup.get('passwordConfirm')?.value || '';
    return password === confirmPassword ? null : { notMatching: true };
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Đánh dấu tất cả các trường là đã được chạm
      return;
    }
    console.log('Đăng Nhập Thành Công:', this.loginForm.value);
    this.loginForm.reset();
  }

  onSignUpSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched(); // Đánh dấu tất cả các trường là đã được chạm
      return;
    }
    console.log('Đăng Ký Thành Công:', this.signUpForm.value);
    this.signUpForm.reset();
  }

  getErrorMessage(field: string, errors: any): string {
    if (errors?.['required']) {
      return `${this.getFieldName(field)} là bắt buộc`;
    }
    if (errors?.['email']) {
      return 'Vui lòng nhập email hợp lệ.';
    }
    if (errors?.['minlength']) {
      return `${this.getFieldName(field)} phải có ít nhất ${errors.minlength.requiredLength} ký tự.`;
    }
    if (field === 'passwordConfirm' && this.signUpForm.errors?.['notMatching']) {
      return "Mật khẩu không khớp"; 
    }
    return '';
  }

  getFieldName(field: string): string {
    const fieldMap: { [key: string]: string } = {
      email: 'Email',
      password: 'Mật khẩu',
      passwordConfirm: 'Xác nhận Mật khẩu'
    };
    return fieldMap[field] || field;
  }
}