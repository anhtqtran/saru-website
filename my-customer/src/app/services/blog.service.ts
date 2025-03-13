import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://localhost:3000'; // Đổi thành URL backend của bạn

  constructor(private http: HttpClient) {}

  // Lấy danh sách tất cả danh mục
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  // Lấy danh sách tất cả bài viết
  getBlogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/blogs`);
  }

  // Lấy blog theo ObjectId (Dùng cho trang chi tiết blog)
  getBlogById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/blogs/${id}`);
  }

  // Lấy danh mục theo ID
  getCategory(categoryId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories/${categoryId}`);
  }

  // Lấy bài viết theo danh mục
  getBlogsByCategory(categoryId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/blogs/category/${categoryId}`);
  }
}
