<<<<<<< HEAD
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
=======
import { Component, OnInit } from '@angular/core';
import { BlogService } from '../services/blog.service';
import { Blog } from '../classes/Blogs'; // Chỉ dùng Blog
>>>>>>> main

@Component({
  selector: 'app-blog',
  standalone: false,
  templateUrl: './blog.component.html',
<<<<<<< HEAD
  styleUrl: './blog.component.css'
})
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
=======
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  categories: { _id: string; CateblogID: string; CateblogName: string }[] = [];
  blogs: Blog[] = [];
  error: string | null = null;

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.blogService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadBlogs();
      },
      error: (err) => {
        this.error = 'Lỗi khi tải danh mục: ' + err.message;
        console.error('Lỗi tải danh mục:', err);
      }
    });
  }

  loadBlogs() {
    this.blogService.getBlogs().subscribe({
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
        this.error = 'Lỗi khi tải bài viết: ' + err.message;
        console.error('Lỗi tải bài viết:', err);
      }
    });
  }

  getBlogsByCategory(categoryId: string): Blog[] {
    return this.blogs
      .filter(blog => blog.categoryName === this.categories.find(c => c._id === categoryId)?.CateblogName)
      .slice(0, 3);
>>>>>>> main
  }
}
