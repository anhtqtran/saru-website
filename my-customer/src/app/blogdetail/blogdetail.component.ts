import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Blog, BlogDetail } from '../classes/Blogs';
import { BlogapiService } from '../services/blogapi.service';

@Component({
  selector: 'app-blogdetail',
  standalone: false,
  templateUrl: './blogdetail.component.html',
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
      }
    });
  }

  loadRelatedBlogs(): void {
    if (!this.blog) return;
    this.blogService.getRelatedBlogs('cateblog1', this.blog.id, 4).subscribe({
      next: (blogs) => {
        this.relatedBlogs = blogs;
        console.log('Loaded related blogs:', this.relatedBlogs);
      },
      error: (error) => {
        console.error('Error loading related blogs:', error);
      }
    });
  }
}