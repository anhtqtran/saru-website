import { Injectable } from '@angular/core';
import { Feedback } from '../classes/Feedbacks';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FeedbacksapiService {
  private apiUrl = 'https://saru-website-2.onrender.com/api/feedbacks';
  constructor(private http: HttpClient) { }
  getFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.apiUrl);
  }
}
