<<<<<<< HEAD
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
=======
import { Component, OnInit } from '@angular/core';
// import { Title } from '@angular/platform-browser';
import { BlogService } from '../services/blog.service';
>>>>>>> cus_blog

@Component({
  selector: 'app-blog',
  standalone: false,
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
<<<<<<< HEAD
export class BlogComponent {
  //set title of page
  public constructor(private titleService: Title){
    this.titleService.setTitle("Blogs - SARU"); 
  }

  changeBackground(id: string) {
    const div = document.getElementById(id);
    const button = div?.querySelector('button');
    if (div && button) {
      div.style.backgroundColor = '#757575';
      button.style.backgroundColor = '#757575';
      button.style.color = '#FFFFFF';
    }
  }

  resetBackground(id: string) {
    const div = document.getElementById(id);
    const button = div?.querySelector('button');
    if (div && button) {
      div.style.backgroundColor = 'transparent';
      button.style.backgroundColor = 'transparent';
      button.style.color = '#757575';
    }
  }
  changeBackground1(id: string) {
    const div = document.getElementById(id);
    const button = div?.querySelector('button');
    if (div && button) {
      div.style.backgroundColor = 'transparent';
      button.style.backgroundColor = 'transparent';
      button.style.color = '#757575';
    }
  }

  resetBackground1(id: string) {
    const div = document.getElementById(id);
    const button = div?.querySelector('button');
    if (div && button) {
      div.style.backgroundColor = '#757575';
      button.style.backgroundColor = '#757575';
      button.style.color = '#FFFFFF';
    }
  }
}
=======
export class BlogComponent implements OnInit {
  categories: any[] = [];
  blogs: any[] = [];
  error: string | null = null;

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.blogService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Danh mục:', this.categories); // Kiểm tra danh mục
        // Tải bài viết cho từng danh mục
        this.categories.forEach(category => {
          this.loadBlogsByCategory(category._id);
        });
      },
      error: (err) => {
        this.error = 'Lỗi khi tải danh mục: ' + err.message;
        console.error('Lỗi tải danh mục:', err);
      }
    });
  }

  loadBlogsByCategory(categoryId: string) {
    this.blogService.getBlogsByCategory(categoryId).subscribe({
      next: (blogs) => {
        console.log(`Bài viết cho danh mục ${categoryId}:`, blogs); // Kiểm tra bài viết
        this.blogs = [...this.blogs, ...blogs];
      },
      error: (err) => {
        this.error = 'Lỗi khi tải bài viết cho danh mục ' + categoryId + ': ' + err.message;
        console.error('Lỗi tải bài viết:', err);
      }
    });
  }

  getBlogsByCategory(categoryId: string): any[] {
    // Sửa lỗi: categoryID là mảng, cần kiểm tra _id bên trong mảng
    const filteredBlogs = this.blogs
      .filter(blog => {
        // Kiểm tra nếu categoryID là mảng và chứa đối tượng có _id khớp
        return Array.isArray(blog.categoryID) && blog.categoryID.some((cat: any) => cat._id === categoryId);
      })
      .slice(0, 3); // Chỉ lấy 3 bài viết đầu tiên

    console.log(`Bài viết đã lọc cho danh mục ${categoryId}:`, filteredBlogs); // Kiểm tra bài viết đã lọc
    return filteredBlogs;
  }
}
  //set title of page
  // public constructor(private titleService: Title){
  //   this.titleService.setTitle("Blogs - SARU"); 
  // }
>>>>>>> cus_blog
