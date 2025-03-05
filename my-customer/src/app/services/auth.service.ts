import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4200'; // Đảm bảo URL chính xác

  constructor(private http: HttpClient, private router: Router) {}

  // Đăng nhập
  login(email: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/login`;  // URL của API login
    const data = { email, password };

    return this.http.post<any>(url, data).pipe(
      map(response => {
        if (response && response.token) {
          this.storeToken(response.token);  // Lưu token sau khi đăng nhập thành công
          const redirectUrl = localStorage.getItem('redirectUrl') || '/homepage';  // Lấy URL cũ hoặc trang mặc định
          this.router.navigate([redirectUrl]);  // Điều hướng về trang trước đó hoặc trang mặc định
        }
      }),
      catchError(error => {
        console.error('Lỗi đăng nhập:', error);
        throw error; // Bạn có thể xử lý lỗi tại đây
      })
    );
  }

  // Lưu token vào localStorage
  storeToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Lấy token từ localStorage
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Đăng xuất
  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);  // Điều hướng về trang đăng nhập
  }

  // Kiểm tra người dùng đã đăng nhập hay chưa
  isLoggedIn(): boolean {
    return !!this.getToken();  // Kiểm tra nếu có token trong localStorage
  }

  // Đăng ký
  signUp(userData: any): Observable<any> {
    const url = `${this.apiUrl}/signup`;  // URL của API đăng ký
    return this.http.post<any>(url, userData).pipe(
      map(response => {
        if (response && response.token) {
          this.storeToken(response.token);  // Lưu token nếu đăng ký thành công
        }
      }),
      catchError(error => {
        console.error('Lỗi đăng ký:', error);
        throw error;  // Xử lý lỗi tại đây nếu cần
      })
    );
  }
}
