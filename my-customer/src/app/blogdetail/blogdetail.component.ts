<<<<<<< HEAD
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

=======
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { Blog, BlogDetail } from '../classes/Blogs'; // Chỉ dùng Blog và BlogDetail
>>>>>>> main

@Component({
  selector: 'app-blogdetail',
  standalone: false,
  templateUrl: './blogdetail.component.html',
<<<<<<< HEAD
  styleUrl: './blogdetail.component.css'
})
export class BlogdetailComponent {
  //set title of page
  public constructor(private titleService: Title){
    this.titleService.setTitle("Rượu Mận: Đặc sản tình yêu và kí ức vùng trời Tây Bắc - SARU"); 
  }
}
=======
  styleUrls: ['./blogdetail.component.css']
})
export class BlogdetailComponent implements OnInit {
  blog: BlogDetail | null = null;
  relatedBlogs: Blog[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private blogService: BlogService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const blogID = params.get('id');
      if (blogID) {
        this.fetchBlog(blogID);
      } else {
        this.errorMessage = "Không tìm thấy ID bài viết";
        this.isLoading = false;
      }
    });
  }

  fetchBlog(blogID: string): void {
    this.isLoading = true;
    this.blogService.getBlogById(blogID).subscribe({
      next: (data) => {
        this.blog = {
          id: data._id,
          title: data.BlogTitle,
          image: data.BlogImage,
          summary: data.BlogContent.substring(0, 150) + '...',
          categoryID: data.categoryID,
          categoryName: data.categoryName,
          content: data.BlogContent
        };
        this.isLoading = false;

        if (!this.blog) {
          this.errorMessage = "Bài viết không tồn tại hoặc đã bị xóa.";
          return;
        }

        if (data.categoryID) {
          this.getRelatedBlogs(data.categoryID, data._id);
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy bài viết:', err);
        this.errorMessage = "Đã xảy ra lỗi khi tải bài viết.";
        this.isLoading = false;
      }
    });
  }

  getRelatedBlogs(categoryID: string, currentBlogID: string): void {
    this.blogService.getBlogsByCategory(categoryID).subscribe({
      next: (data) => {
        this.relatedBlogs = data
          .filter(b => b._id !== currentBlogID)
          .map(b => ({
            id: b._id,
            title: b.BlogTitle,
            image: b.BlogImage,
            summary: b.BlogContent.substring(0, 150) + '...',
            categoryName: b.categoryName
          }));
      },
      error: (err) => {
        console.error('Lỗi khi lấy bài viết liên quan:', err);
      }
    });
  }
}
>>>>>>> main
