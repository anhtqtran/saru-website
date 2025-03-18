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
<<<<<<< HEAD
    this.router.navigate(['/home']); // Chuyển hướng đến trang chủ
=======
    this.router.navigate(['/homepage']); // Chuyển hướng đến trang chủ
>>>>>>> main
}
}
