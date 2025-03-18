<<<<<<< HEAD
import { Component } from '@angular/core';
=======
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
>>>>>>> main

@Component({
  selector: 'app-sendcode',
  standalone: false,
  templateUrl: './sendcode.component.html',
<<<<<<< HEAD
  styleUrl: './sendcode.component.css'
})
export class SendcodeComponent {
  email: string = 'example@email.com';

  nextStep() {
    window.location.href = "newpass"; // Change this to your Angular routing
  }

  moveNext(event: any, nextId: string) {
    if (event.target.value.length === 1) {
      const nextInput = document.getElementById(nextId);
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  hidePopup() {
    // Implement logic to hide the popup/modal if necessary
  }
}
=======
  styleUrls: ['./sendcode.component.css']
})
export class SendcodeComponent implements OnInit {
  email: string = '';
  otpInputs: string[] = ['', '', '', '', '', ''];
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Lấy email từ state
    const navigation = this.router.getCurrentNavigation();
    this.email = navigation?.extras.state?.['email'] || history.state.email || '';
    if (!this.email) {
      this.router.navigate(['/resetpass']);
    }
  }

  nextStep() {
    const otp = this.otpInputs.join('');
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      this.errorMessage = 'Vui lòng nhập 6 chữ số OTP hợp lệ.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    console.log('Verifying OTP:', { email: this.email, otp }); // Debug

    this.authService.verifyOtp(this.email, otp).subscribe({
      next: (response) => {
        console.log('Xác minh OTP thành công:', response);
        this.isLoading = false;
        this.router.navigate(['/newpass'], { state: { email: this.email } });
      },
      error: (error) => {
        console.error('Xác minh OTP thất bại:', error);
        this.isLoading = false;
        this.errorMessage = error.message === 'OTP không hợp lệ.' 
          ? 'Mã OTP bạn nhập không đúng.' 
          : 'Xác minh thất bại, vui lòng thử lại.';
      }
    });
  }
  
  moveNext(event: any, index: number) {
    const input = event.target;
    this.otpInputs[index - 2] = input.value;
    if (input.value.length === 1 && index <= 6) {
      const nextInput = document.getElementById(`otp${index}`);
      if (nextInput) nextInput.focus();
    }
    if (index === 6 && this.otpInputs.every(val => val.length === 1)) {
      this.nextStep(); // Tự động gửi khi đủ 6 số
    }
  }
  resendOtp(event: Event) {
    event.preventDefault(); // Ngăn hành vi mặc định của <a>
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        console.log('Gửi lại OTP thành công:', response);
        this.isLoading = false;
        this.errorMessage = 'Mã OTP mới đã được gửi đến email của bạn.';
        setTimeout(() => this.errorMessage = '', 3000); // Xóa thông báo sau 3 giây
      },
      error: (error) => {
        console.error('Gửi lại OTP thất bại:', error);
        this.isLoading = false;
        this.errorMessage = error.message || 'Gửi mã thất bại, vui lòng thử lại.';
      }
    });
  }

  hidePopup() {
    this.router.navigate(['/login']);
  }
}
>>>>>>> main
