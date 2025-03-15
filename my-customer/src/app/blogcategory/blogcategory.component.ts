import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { Blog } from '../classes/Blogs'; // Chỉ dùng Blog

@Component({
  selector: 'app-blogcategory',
  standalone: false,
  templateUrl: './blogcategory.component.html',
  styleUrls: ['./blogcategory.component.css']
})
export class BlogcategoryComponent implements OnInit {
  category: { _id: string; CateblogID: string; CateblogName: string } | null = null;
  blogs: Blog[] = [];
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
    this.blogService.getCategory(categoryId).subscribe({
      next: (category) => {
        this.category = category; // Giữ nguyên dữ liệu từ backend
      },
      error: (err) => {
        this.error = 'Lỗi khi tải thông tin danh mục: ' + err.message;
      }
    });

    this.blogService.getBlogsByCategory(categoryId).subscribe({
      next: (blogs) => {
        this.blogs = blogs.map(b => ({
          id: b._id,
          title: b.BlogTitle,
          image: b.BlogImage,
          summary: b.BlogContent.substring(0, 150) + '...',
          categoryName: b.categoryName
        }));
      },
      error: (err) => {
        this.error = 'Lỗi khi tải danh sách bài viết: ' + err.message;
      }
    });
  }
}