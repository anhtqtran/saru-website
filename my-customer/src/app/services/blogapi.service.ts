import { Injectable } from '@angular/core';
import { Blog, BlogDetail } from '../classes/Blogs';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class BlogapiService {
  private apiUrl = 'https://saru-website-2.onrender.com/api';

  constructor(private http: HttpClient) {}

  // Gọi API để lấy 2 bài viết ngẫu nhiên theo danh mục
  getRandomBlogs(cateblogId: string = 'cateblog1'): Observable<Blog[]> {
    // Nếu bạn dùng endpoint /api/blogs/random
    return this.http.get<Blog[]>(`${this.apiUrl}/blogs/random`, { params: { cateblogId } }).pipe(
      map(blogs => blogs || []),
      catchError(err => {
        console.error('Error fetching random blogs:', err);
        return throwError(() => new Error('Không thể lấy danh sách bài viết'));
      })
    );
  }
  getBlogDetail(id: string): Observable<BlogDetail> {
    return this.http.get<BlogDetail>(`${this.apiUrl}/blogs/${id}`).pipe(
      catchError(err => {
        console.error('Error fetching blog detail:', err);
        return throwError(() => new Error(`Không thể lấy chi tiết bài viết với ID ${id}`));
      })
    );
  }

  getRelatedBlogs(cateblogId: string, excludeBlogId: string, limit: number = 4): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/blogs/random`, { params: { cateblogId, excludeBlogId, limit: limit.toString() } }).pipe(
      map(blogs => blogs || []),
      catchError(err => {
        console.error('Error fetching related blogs:', err);
        return throwError(() => new Error('Không thể lấy danh sách bài viết liên quan'));
      })
    );
  }
}
