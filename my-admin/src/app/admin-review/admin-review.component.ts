import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../services/review.service';
import { Review } from '../classes/review';
import { Customer } from '../classes/review';

@Component({
  selector: 'app-admin-review',
  standalone: false,
  templateUrl: './admin-review.component.html',
  styleUrl: './admin-review.component.css'
})
export class AdminReviewComponent implements OnInit {
   reviewsWithCustomer: { review: Review, customer: Customer }[] = [];
  filteredReviewsWithCustomer: { review: Review, customer: Customer }[] = [];

  filterStartDate: string = '';
  filterEndDate: string = '';
  filterRatings: number[] = [];

  sortOrder: string = 'newest'; // Mặc định sắp xếp mới nhất

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviewsWithCustomers();
  }

  loadReviewsWithCustomers(): void {
    this.reviewService.getReviewsWithCustomers(this.filterStartDate, this.filterEndDate, this.filterRatings.join(',')).subscribe(
      (data: any[]) => {
        this.reviewsWithCustomer = data.map(item => ({
          review: {
            _id: item._id || '',
            ReviewID: item.ReviewID,
            ProductID: item.ProductID,
            CustomerID: item.CustomerID,
            Content: item.Content || '',
            Rating: item.Rating || 0,
            DatePosted: item.DatePosted || '',
            Images: item.Images || []
          },
          customer: {
            _id: item._id || '',
            CustomerID: item.CustomerID,
            CustomerName: item.CustomerName || 'Không xác định',
            CustomerAdd: item.CustomerAdd || '',
            CustomerPhone: item.CustomerPhone || '',
            CustomerBirth: item.CustomerBirth || '',
            CustomerAvatar: item.CustomerAvatar || '',
            ReceiveEmail: item.ReceiveEmail || false
          }
        }));
        this.applyFilters();
      },
      (error) => {
        console.error('Lỗi khi tải danh sách đánh giá với thông tin khách hàng:', error);
      }
    );
  }

  applyFilters(): void {
    this.filteredReviewsWithCustomer = [...this.reviewsWithCustomer];

    if (this.filterStartDate || this.filterEndDate) {
      const start = this.filterStartDate ? new Date(this.filterStartDate).getTime() : -Infinity;
      const end = this.filterEndDate ? new Date(this.filterEndDate).getTime() : Infinity;
      this.filteredReviewsWithCustomer = this.filteredReviewsWithCustomer.filter(item => {
        const reviewDate = new Date(item.review.DatePosted).getTime();
        return reviewDate >= start && reviewDate <= end;
      });
    }

    if (this.filterRatings.length > 0) {
      this.filteredReviewsWithCustomer = this.filteredReviewsWithCustomer.filter(item =>
        this.filterRatings.includes(item.review.Rating)
      );
    }

    // Sắp xếp
    this.filteredReviewsWithCustomer.sort((a, b) => {
      switch (this.sortOrder) {
        case 'newest':
          return new Date(b.review.DatePosted).getTime() - new Date(a.review.DatePosted).getTime();
        case 'oldest':
          return new Date(a.review.DatePosted).getTime() - new Date(b.review.DatePosted).getTime();
        case 'ratingAsc':
          return a.review.Rating - b.review.Rating;
        case 'ratingDesc':
          return b.review.Rating - a.review.Rating;
        default:
          return 0;
      }
    });
  }

  deleteReview(reviewId?: string): void {
  if (!reviewId) {
    console.warn('Delete called without reviewId');
    return;
  }
  if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
    return;
  }
  this.reviewService.deleteReview(reviewId).subscribe({
    next: () => this.loadReviewsWithCustomers(),
    error: (err) => {
      console.error('Lỗi khi xóa đánh giá:', err);
      alert('Xóa đánh giá thất bại, vui lòng thử lại.');
    }
  });
}

}