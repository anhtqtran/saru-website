import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { Blog } from '../classes/Blogs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-blogcategory',
  standalone: false,
  templateUrl: './blogcategory.component.html',
  styleUrls: ['./blogcategory.component.css']
})
export class BlogcategoryComponent implements OnInit, OnDestroy {
  category: { _id: string; CateblogID: string; CateblogName: string } | null = null;
  blogs: Blog[] = [];
  error: string | null = null;
  private routeSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService
  ) {}

  ngOnInit() {
    // Lắng nghe thay đổi tham số route
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const categoryId = params.get('id');
      if (categoryId) {
        this.loadCategoryData(categoryId); // Tải lại dữ liệu khi categoryId thay đổi
      } else {
        this.error = 'Không tìm thấy danh mục';
      }
    });

    // Lắng nghe sự kiện NavigationEnd để đảm bảo làm mới khi route thay đổi
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const categoryId = this.route.snapshot.paramMap.get('id');
        if (categoryId) {
          this.loadCategoryData(categoryId); // Tải lại dữ liệu khi navigation hoàn tất
        }
      }
    });
  }

  loadCategoryData(categoryId: string) {
    // Đặt lại trạng thái ban đầu
    this.category = null;
    this.blogs = [];
    this.error = null;

    // Tải thông tin danh mục
    this.blogService.getCategory(categoryId).subscribe({
      next: (category) => {
        this.category = category; // Giữ nguyên dữ liệu từ backend
        console.log('Loaded category:', category);
      },
      error: (err) => {
        this.error = 'Lỗi khi tải thông tin danh mục: ' + err.message;
        console.error('Category load error:', err);
      }
    });

    // Tải danh sách bài viết
    this.blogService.getBlogsByCategory(categoryId).subscribe({
      next: (blogs) => {
        console.log('Dữ liệu bài viết từ API:', blogs); // Debug

        this.blogs = blogs.map(b => ({
          id: b._id, // Đảm bảo sử dụng đúng _id từ database
          title: b.BlogTitle,
          image: b.BlogImage,
          summary: b.BlogContent.substring(0, 150) + '...',
          categoryName: b.categoryName
        }));

        console.log('Dữ liệu bài viết sau khi xử lý:', this.blogs); // Debug
      },
      error: (err) => {
        this.error = 'Lỗi khi tải danh sách bài viết: ' + err.message;
        console.error('Blogs load error:', err);
      }
    });
  }

  ngOnDestroy() {
    // Hủy các subscription để tránh rò rỉ bộ nhớ
    this.routeSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }
}