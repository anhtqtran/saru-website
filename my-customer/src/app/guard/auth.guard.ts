import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Nếu người dùng chưa đăng nhập
    if (!this.authService.isLoggedIn()) {
      // Lưu URL hiện tại vào localStorage
      localStorage.setItem('redirectUrl', state.url);

      // Chuyển hướng đến trang login
      this.router.navigate(['/home']);
      return false;
    }
    
    // Nếu đã đăng nhập, cho phép truy cập trang
    return true;
  }
}
