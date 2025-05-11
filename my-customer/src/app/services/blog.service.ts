import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface cho danh mục
interface BlogCategory {
  _id: string;
  CateblogID: string;
  CateblogName: string;
}

// Interface cho bài viết
interface Blog {
  _id: string;
  BlogID: string;
  BlogTitle: string;
  BlogContent: string;
  BlogImage: string;
  categoryID: string; // Chuỗi đơn lẻ (ObjectId dưới dạng string)
  categoryName: string; // Tên danh mục từ backend
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'https://saru-website-2.onrender.com'; // Đổi thành URL backend của bạn nếu khác

  constructor(private http: HttpClient) {}

  // Lấy danh sách tất cả danh mục
  getCategories(): Observable<BlogCategory[]> {
    return this.http.get<BlogCategory[]>(`${this.apiUrl}/categories`);
  }

  // Lấy danh sách tất cả bài viết
  getBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/blogs`);
  }

  // Lấy blog theo ObjectId (Dùng cho trang chi tiết blog)
  getBlogById(id: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/blogs/${id}`);
  }

  // Lấy danh mục theo ID
  getCategory(categoryId: string): Observable<BlogCategory> {
    return this.http.get<BlogCategory>(`${this.apiUrl}/categories/${categoryId}`);
  }

  // Lấy bài viết theo danh mục
  getBlogsByCategory(categoryId: string): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/blogs/category/${categoryId}`);
  }
}