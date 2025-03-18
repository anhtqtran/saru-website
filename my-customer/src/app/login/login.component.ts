import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isSignUpMode = false;
  loginError = '';
  signUpError = '';
  isLoading = false;
  loginForm: FormGroup;
  signUpForm: FormGroup;
  passwordVisibility = {
    loginPassword: false,
    signUpPassword: false,
    passwordConfirm: false,
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
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
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('email');
    const remember = localStorage.getItem('remember') === 'true';

    if (savedEmail && remember && this.authService.isLoggedIn()) {
      this.loginForm.patchValue({ email: savedEmail, remember: true });
      this.router.navigate(['/homepage']);
    }

    this.authService.getLoginStatus().subscribe((isLoggedIn) => {
      if (isLoggedIn && this.router.url === '/login') {
        this.router.navigate(['/homepage']);
      }
    });
  }

  toggleSignUpMode(): void {
    this.isSignUpMode = !this.isSignUpMode;
    this.loginError = '';
    this.signUpError = '';
    if (this.loginForm.dirty) this.loginForm.reset();
    if (this.signUpForm.dirty) this.signUpForm.reset();
  }

  togglePasswordVisibility(field: 'loginPassword' | 'signUpPassword' | 'passwordConfirm'): void {
    this.passwordVisibility[field] = !this.passwordVisibility[field];
  }

  passwordMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const password = formGroup.get('password')?.value || '';
    const confirmPassword = formGroup.get('passwordConfirm')?.value || '';
    return password === confirmPassword ? null : { notMatching: true };
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = '';
    const { email, password, remember } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (remember) {
          localStorage.setItem('email', email); // Chỉ lưu email, không lưu password
          localStorage.setItem('remember', 'true');
        } else {
          localStorage.removeItem('email');
          localStorage.removeItem('remember');
        }
        this.isLoading = false;
        console.log('Đăng nhập thành công:', response.message);
        // Điều hướng được xử lý trong AuthService, không cần lặp lại ở đây
      },
      error: (error) => {
        this.isLoading = false;
        this.loginError = error.message; // Dùng thông điệp từ AuthService
        console.error('Đăng nhập thất bại:', error);
      }
    });
  }

  onSignUpSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.signUpError = '';
    const { email, password, subscribe } = this.signUpForm.value;

    this.authService.signUp({ email, password, subscribe }).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Đăng ký thành công:', response.message);
        // Điều hướng được xử lý trong AuthService
      },
      error: (error) => {
        this.isLoading = false;
        this.signUpError = error.message; // Dùng thông điệp từ AuthService
        console.error('Đăng ký thất bại:', error);
      }
    });
  }

getErrorMessage(field: string, form: FormGroup): string {
    const errors = form.get(field)?.errors;
    if (!errors) return '';

    if (errors['required']) return `${this.getFieldName(field)} là bắt buộc`;
    if (errors['email']) return 'Vui lòng nhập email hợp lệ.';
    if (errors['minlength']) return `${this.getFieldName(field)} phải có ít nhất ${errors['minlength'].requiredLength} ký tự.`;
    if (field === 'passwordConfirm' && form.errors?.['notMatching']) return 'Mật khẩu không khớp';
    return '';
  }

  getFieldName(field: string): string {
    const fieldMap: { [key: string]: string } = {
      email: 'Email',
      password: 'Mật khẩu',
      passwordConfirm: 'Xác nhận mật khẩu'
    };
    return fieldMap[field] || field;
  }
}
