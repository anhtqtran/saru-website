import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-resetpass',
  standalone: false,
  templateUrl: './resetpass.component.html',
  styleUrl: './resetpass.component.css'
})
export class ResetpassComponent {

constructor(private router: Router) {}

onSubmit() {
  // Chuyển hướng đến trang sendcode
  this.router.navigate(['/sendcode']);
}

hidePopup() {
  // Logic để ẩn popup nếu cần
}


}
