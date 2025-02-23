import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Promotion {
  id: number;
  name: string;
  time: string;
  code: string;
  status: string;
  used: string;
  selected: boolean;
  startDate?: string;
  endDate?: string;
}

@Component({
  selector: 'app-khuyenmai-list',
  templateUrl: './khuyenmai-list.component.html',
  styleUrls: ['./khuyenmai-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class KhuyenmaiListComponent implements OnInit {
  currentRole: string = 'admin';
  promos: Promotion[] = [
    {
      id: 1,
      name: 'Tên khuyến mãi',
      time: 'Thời gian',
      code: 'SARUSALE',
      status: 'Đang khuyến mãi',
      used: '10/50',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      selected: false
    }
  ];
  displayQuantity: number = 20;
  selectAllChecked: boolean = false;
  isDeletePopupVisible: boolean = false;
  promotionToDelete: Promotion | null = null;
  filterCondition: string = '';
  searchKeyword: string = '';
  filteredPromos: Promotion[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.filteredPromos = [...this.promos];
  }

  changePage(role: string) {
    this.currentRole = role;
  }

  toggleSelectAll() {
    this.selectAllChecked = !this.selectAllChecked;
    this.filteredPromos.forEach(promo => promo.selected = this.selectAllChecked);
  }

  updateSelectAllStatus() {
    this.selectAllChecked = this.filteredPromos.every(promo => promo.selected);
  }

  togglePromoSelection(promo: Promotion) {
    promo.selected = !promo.selected;
    this.updateSelectAllStatus();
  }

  openCreatePromotion() {
    try {
      const url = this.router.serializeUrl(this.router.createUrlTree(['/khuyenmai-create']));
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening create promotion page:', error);
    }
  }

  goToPromotionDetail(promotion: Promotion) {
    try {
      const url = this.router.serializeUrl(this.router.createUrlTree(['/khuyenmai-detail', promotion.id]));
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening promotion detail page:', error);
    }
  }

  confirmDelete(promotion: Promotion) {
    this.promotionToDelete = promotion;
    this.isDeletePopupVisible = true;
  }

  deletePromotion() {
    if (this.promotionToDelete) {
      this.promos = this.promos.filter(p => p.id !== this.promotionToDelete!.id);
      this.filteredPromos = this.filteredPromos.filter(p => p.id !== this.promotionToDelete!.id);
      alert('Khuyến mãi đã được xóa.');
    }
    this.closeDeletePopup();
  }

  closeDeletePopup() {
    this.isDeletePopupVisible = false;
    this.promotionToDelete = null;
  }

  applyFilter() {
    this.filteredPromos = this.promos.filter(promo => {
      if (this.filterCondition) {
        const condition = this.filterCondition.toLowerCase();
        if (condition.includes('từ ngày')) {
          const startDate = new Date(condition.split('từ ngày')[1].trim());
          return new Date(promo.startDate!) >= startDate;
        } else if (condition.includes('đến ngày')) {
          const endDate = new Date(condition.split('đến ngày')[1].trim());
          return new Date(promo.endDate!) <= endDate;
        } else if (condition.includes('đang khuyến mãi')) {
          return promo.status.toLowerCase() === 'đang khuyến mãi';
        }
      }
      return true;
    });
    this.updateSelectAllStatus();
  }

  search() {
    this.applyFilter();
    if (this.searchKeyword) {
      const keyword = this.searchKeyword.toLowerCase();
      this.filteredPromos = this.filteredPromos.filter(promo =>
        promo.name.toLowerCase().includes(keyword) ||
        promo.code.toLowerCase().includes(keyword)
      );
    }
    this.updateSelectAllStatus();
  }
}
