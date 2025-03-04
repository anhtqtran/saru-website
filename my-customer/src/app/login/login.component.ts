  import { Component, OnInit  } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { AuthService } from '../services/auth.service';
  import { Router } from '@angular/router';  // Nhập Router


  @Component({
    selector: 'app-login',
    standalone: false,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
  })
  export class LoginComponent implements OnInit {
    isSignUpMode: boolean = false;
    loginForm: FormGroup;
    signUpForm: FormGroup;
    passwordVisibility = {
      loginPassword: false,
      signUpPassword: false,
      passwordConfirm: false,
    };

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
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
    ngOnInit(): void {
      const savedEmail = localStorage.getItem('email');
      const savedPassword = localStorage.getItem('password');
      const remember = localStorage.getItem('remember') === 'true';

      if (savedEmail && savedPassword && remember) {
        this.loginForm.patchValue({
          email: savedEmail,
          password: savedPassword,
          remember: remember,
        });
      }
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
        this.loginForm.markAllAsTouched();
        return;
      }
    
      const { email, password, remember } = this.loginForm.value;
    
      this.authService.login(email, password).subscribe(
        (response: any) => {
          if (response && response.token) {
            this.authService.storeToken(response.token);
            if (remember) {
              localStorage.setItem('email', email);
              localStorage.setItem('password', password);
              localStorage.setItem('remember', 'true');
            } else {
              localStorage.removeItem('email');
              localStorage.removeItem('password');
              localStorage.removeItem('remember');
            }
            this.router.navigate(['/homepage']);
          }
        },
        (error: any) => {
          console.error('Đăng nhập thất bại:', error);
          alert('Đăng nhập thất bại, vui lòng kiểm tra lại thông tin.');
        }
      );
    }


    onSignUpSubmit(): void {
      if (this.signUpForm.invalid) {
        this.signUpForm.markAllAsTouched();
        return;
      }
    
      const { email, password, subscribe } = this.signUpForm.value;
    
      this.authService.signUp({ email, password }).subscribe(
        (response: any) => {
          if (response && response.token) {
            this.authService.storeToken(response.token);
            console.log('Đăng ký thành công:', response);
            this.router.navigate(['/homepage']);
          }
        },
        (error: any) => {
          console.error('Đăng ký thất bại:', error);
          alert('Đăng ký thất bại, vui lòng thử lại!');
        }
      );
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