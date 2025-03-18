import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private router: Router) {}
  // currentSection: string = 'home';

  // showSection(sectionId: string) {
  //   this.currentSection = sectionId;
  // }

  navigateTo(sectionId: string) {
    console.log(` Điều hướng đến: ${sectionId}`); // Kiểm tra log khi click
  
    if (sectionId === 'home') {
      this.router.navigateByUrl('/inventorymanage').then(success => {
        if (!success) {
          console.error("Lỗi điều hướng tới /inventorymanage");
        }
      });
    } else {
      this.router.navigateByUrl('/' + sectionId).then(success => {
        if (!success) {
          console.error(`Lỗi điều hướng tới /${sectionId}`);
        }
      });
    }
  }
  openDropdownId: string | null = null;

  toggleDropdown(id: string) {
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  isDropdownOpen(id: string): boolean {
    return this.openDropdownId === id;
  }
}
