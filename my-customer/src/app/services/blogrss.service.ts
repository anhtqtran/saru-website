import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BlogrssService {
  private proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url='; // Proxy tránh CORS

  constructor(private http: HttpClient) {}

  getFeed(url: string): Observable<any[]> {
    return this.http.get<any>(`${this.proxyUrl}${encodeURIComponent(url)}`).pipe(
      map((response: any) => {
        if (!response || !response.items) {
          return [];
        }
        return response.items.map((item: any) => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          contentSnippet: item.description // Sử dụng description thay vì contentSnippet
        }));
      }),
      catchError(error => {
        console.error('Error fetching RSS feed:', error);
        return [];
      })
    );
  }
}