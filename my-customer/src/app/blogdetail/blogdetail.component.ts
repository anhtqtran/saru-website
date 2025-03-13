import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../services/blog.service';


@Component({
  selector: 'app-blogdetail',
  standalone: false,
  templateUrl: './blogdetail.component.html',
  styleUrl: './blogdetail.component.css'
})
export class BlogdetailComponent implements OnInit {
  blog: any;
  relatedBlogs: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private blogService: BlogService) {}

  ngOnInit(): void {
    // ✅ Theo dõi URL thay đổi để cập nhật bài viết khi chuyển giữa các bài viết liên quan
    this.route.paramMap.subscribe(params => {
      const blogID = params.get('id');
      if (blogID) {
        this.fetchBlog(blogID);
      } else {
        this.errorMessage = "Không tìm thấy ID bài viết";
      }
    });
  }

  // ✅ Lấy dữ liệu bài viết chi tiết
  fetchBlog(blogID: string): void {
    this.isLoading = true;
    this.blogService.getBlogById(blogID).subscribe({
      next: (data) => {
        this.blog = data;
        this.isLoading = false;

        if (!this.blog) {
          this.errorMessage = "Bài viết không tồn tại hoặc đã bị xóa.";
          return;
        }

        // ✅ Kiểm tra danh mục
        if (this.blog?.categoryID?.length > 0) {
          this.blog.categoryName = this.blog.categoryID[0]?.CateblogName || 'Không có danh mục';
          this.getRelatedBlogs(this.blog.categoryID[0]._id, this.blog._id);
        } else {
          this.blog.categoryName = 'Không có danh mục';
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy bài viết:', err);
        this.errorMessage = "Đã xảy ra lỗi khi tải bài viết.";
        this.isLoading = false;
      }
    });
  }

  // ✅ Lấy danh sách bài viết cùng danh mục (loại bỏ bài viết hiện tại)
  getRelatedBlogs(categoryID: string, currentBlogID: string): void {
    this.blogService.getBlogsByCategory(categoryID).subscribe({
      next: (data) => {
        console.log('Related Blogs:', data);
        if (!data || data.length === 0) {
          console.warn("Không tìm thấy bài viết liên quan.");
          return;
        }
        this.relatedBlogs = data.filter(b => b._id !== currentBlogID);
        console.log('Filtered Related Blogs:', this.relatedBlogs);
      },
      error: (err) => {
        console.error('Lỗi khi lấy bài viết liên quan:', err);
      }
    });
  }
}