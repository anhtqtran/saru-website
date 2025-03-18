import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resetpass',
  standalone: false,
  templateUrl: './resetpass.component.html',
  styleUrl: './resetpass.component.css'
})

export class ResetpassComponent {
  forgotPasswordForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const email = this.forgotPasswordForm.get('email')?.value;
    console.log('Sending forgot password request:', { email }); // Debug

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        console.log('Gửi OTP thành công:', response);
        this.isLoading = false;
        this.router.navigate(['/sendcode'], { state: { email } });
      },
      error: (error) => {
        console.error('Gửi OTP thất bại:', error);
        this.isLoading = false;

        this.errorMessage = error.message === 'Email không tồn tại.' 
          ? 'Email này chưa được đăng ký.' 
          : 'Gửi mã xác thực thất bại, vui lòng thử lại.';
      }
    });
  }

  hidePopup() {
    this.router.navigate(['/login']);
  }
}
