import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../services/blog.service';

@Component({
  selector: 'app-blogcategory',
  standalone: false,
  templateUrl: './blogcategory.component.html',
  styleUrl: './blogcategory.component.css'
})
export class BlogcategoryComponent implements OnInit {
  category: any = null;
  blogs: any[] = [];
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  ngOnInit() {
    const categoryId = this.route.snapshot.paramMap.get('id');
    if (categoryId) {
      this.loadCategoryData(categoryId);
    } else {
      this.error = 'Không tìm thấy danh mục';
    }
  }

  loadCategoryData(categoryId: string) {
    // Lấy thông tin category
    this.blogService.getCategory(categoryId).subscribe({
      next: (category) => {
        this.category = category;
      },
      error: (err) => {
        this.error = 'Lỗi khi tải thông tin danh mục: ' + err.message;
      }
    });

    // Lấy danh sách blog theo category
    this.blogService.getBlogsByCategory(categoryId).subscribe({
      next: (blogs) => {
        this.blogs = blogs;
      },
      error: (err) => {
        this.error = 'Lỗi khi tải danh sách bài viết: ' + err.message;
      }
    });
  }
}