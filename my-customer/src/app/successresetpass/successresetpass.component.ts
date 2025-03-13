import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-successresetpass',
  standalone: false,
  templateUrl: './successresetpass.component.html',
  styleUrl: './successresetpass.component.css'
})
export class SuccessresetpassComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/homepage']); // Chuyển hướng đến trang chủ
}
}
