import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  currentSection: string = 'home';

  showSection(sectionId: string) {
    this.currentSection = sectionId;
  }

  changePage(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    console.log('Changing page to:', value);
    // Implement your page change logic here
  }
  
}
