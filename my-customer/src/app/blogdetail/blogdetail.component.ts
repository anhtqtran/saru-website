import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
<<<<<<< HEAD
import { Title } from '@angular/platform-browser';
import { Blog, BlogDetail } from '../classes/Blogs';
import { BlogapiService } from '../services/blogapi.service';
=======
import { BlogService } from '../services/blog.service';

>>>>>>> cus_blog

@Component({
  selector: 'app-blogdetail',
  standalone: false,
  templateUrl: './blogdetail.component.html',
<<<<<<< HEAD
  styleUrls: ['./blogdetail.component.css']
})
export class BlogdetailComponent implements OnInit {
  blog: BlogDetail | null = null;
  relatedBlogs: Blog[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogapiService, // Sử dụng BlogapiService thay vì BlogService
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.loadBlogDetail();
  }

  loadBlogDetail(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'ID bài viết không hợp lệ';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.blogService.getBlogDetail(id).subscribe({
      next: (blog) => {
        this.blog = blog;
        this.titleService.setTitle(`${blog.title} - SARU`);
        this.isLoading = false;
        console.log('Loaded blog detail:', this.blog);
        this.loadRelatedBlogs();
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải chi tiết bài viết. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading blog detail:', error);
=======
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
>>>>>>> cus_blog
      }
    });
  }

<<<<<<< HEAD
  loadRelatedBlogs(): void {
    if (!this.blog) return;
    this.blogService.getRelatedBlogs('cateblog1', this.blog.id, 4).subscribe({
      next: (blogs) => {
        this.relatedBlogs = blogs;
        console.log('Loaded related blogs:', this.relatedBlogs);
      },
      error: (error) => {
        console.error('Error loading related blogs:', error);
=======
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
>>>>>>> cus_blog
      }
    });
  }
}