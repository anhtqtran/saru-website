import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, throwError, tap, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { Account } from '../classes/Account';
import { ProductService } from './product.service';

// Interface cho từng loại response từ backend
interface LoginResponse {
  message: string;
  token: string;
  account: Account;
}

interface RegisterResponse {
  message: string;
  token: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface VerifyOtpResponse {
  message: string;
  email: string;
}

interface ResetPasswordResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api';
  private tokenKey = 'authToken';
  private _currentUser: Account | null = null;
  private loginStatus = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(
    private http: HttpClient,
    private router: Router,
    private productService: ProductService
  ) {
    const token = this.getToken();
    if (token) {
      this.verifyToken().subscribe(isValid => {
        if (isValid) {
          this.refreshUserData();
          this.http.get<{ message: string; account: Account }>(`${this.apiUrl}/verify-token`, {
            headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
          }).subscribe({
            next: (response) => { // Sửa từ 'account' thành 'response' để khớp với type
              this._currentUser = response.account; // Sửa lỗi: dùng 'response' thay vì 'account'
              this.currentUserSubject.next(response.account);
              this.loginStatus.next(true);
            },
            error: () => {
              this.removeToken();
              this.currentUserSubject.next(null);
              this.loginStatus.next(false);
            }
          });
        } else {
          this.removeToken();
          this.currentUserSubject.next(null);
          this.loginStatus.next(false);
        }
      });
    }
  }

  // Xử lý lỗi chi tiết hơn dựa trên mã HTTP status
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Đã xảy ra lỗi, vui lòng thử lại sau.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi mạng: ${error.error.message}`;
      console.error('Client/Network API Error:', errorMessage, error);
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
          break;
        case 401:
          errorMessage = error.error?.message || 'Email hoặc mật khẩu không đúng.';
          break;
        case 403:
          errorMessage = error.error?.message || 'Không có quyền truy cập.';
          break;
        case 404:
          errorMessage = error.error?.message || 'Không tìm thấy endpoint.';
          break;
        case 500:
          errorMessage = 'Lỗi hệ thống, vui lòng thử lại sau.';
          break;
        default:
          errorMessage = error.error?.message || 'Lỗi không xác định.';
      }
      console.error('Server API Error:', errorMessage, error.status, error.error);
    }
    return throwError(() => new Error(errorMessage));
  }

  // Đăng nhập
  private currentUserSubject = new BehaviorSubject<Account | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        if (response.token) {
          this.storeToken(response.token);
          this._currentUser = response.account;
          this.currentUserSubject.next(response.account);
          this.loginStatus.next(true);
          this.refreshUserData(); // Tải lại dữ liệu sau đăng nhập
          this.router.navigate(['/homepage']);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Đăng ký
  signUp(credentials: { email: string; password: string; subscribe?: boolean }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          this.storeToken(response.token);
          this.loginStatus.next(true);
          this.refreshUserData(); // Tải lại dữ liệu sau đăng ký
          this.router.navigate(['/homepage']);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Quên mật khẩu
  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  // Xác minh OTP
  verifyOtp(email: string, otp: string): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(`${this.apiUrl}/verify-otp`, { email, otp }).pipe(
      catchError(this.handleError)
    );
  }

  // Đặt lại mật khẩu
  resetPassword(email: string, newPassword: string): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.apiUrl}/reset-password`, { email, newPassword }).pipe(
      catchError(this.handleError)
    );
  }

  // Tải lại dữ liệu giỏ hàng và danh sách so sánh
  private refreshUserData(): void {
    this.productService.getCartItems().subscribe({
      next: (cart) => {
        this.productService.updateCart(cart);
        console.log('Cart refreshed:', cart);
      },
      error: (err) => console.error('Error refreshing cart:', err)
    });
    this.productService.getCompareItems().subscribe({
      next: (compare) => {
        this.productService.updateCompare(compare);
        console.log('Compare list refreshed:', compare);
      },
      error: (err) => console.error('Error refreshing compare list:', err)
    });
  }

  // Lưu token
  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Lấy token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Xóa token
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    this._currentUser = null;
    this.loginStatus.next(false);
  }

  // Kiểm tra trạng thái đăng nhập
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  verifyToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) return of(false);

    return this.http.get<{ message: string; account: Account }>(`${this.apiUrl}/verify-token`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // Đăng xuất
  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
      }).subscribe({
        next: () => {
          this.removeToken();
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Logout API error:', err);
          this.removeToken();
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.removeToken();
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  // Lấy thông tin user hiện tại
  getCurrentUser(): Account | null {
    return this._currentUser;
  }

  // Theo dõi trạng thái đăng nhập
  getLoginStatus(): Observable<boolean> {
    return this.loginStatus.asObservable();
  }
}