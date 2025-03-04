import { Component } from '@angular/core';

@Component({
  selector: 'app-sendcode',
  standalone: false,
  templateUrl: './sendcode.component.html',
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
