import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // Corrected from styleUrl to styleUrls
})
export class LoginComponent {
  isSignUpMode: boolean = false;

  toggleSignUpMode() {
    this.isSignUpMode = !this.isSignUpMode;
  }
}