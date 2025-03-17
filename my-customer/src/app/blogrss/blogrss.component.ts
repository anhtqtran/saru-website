import { Component, OnInit } from '@angular/core';
import { BlogrssService } from '../services/blogrss.service';

@Component({
  selector: 'app-blogrss',
  standalone: false,
  templateUrl: './blogrss.component.html',
  styleUrl: './blogrss.component.css'
})
export class BlogrssComponent implements OnInit {
  articles: any[] = [];

  constructor(private blogRssService: BlogrssService) {}

  ngOnInit() {
    this.blogRssService.getFeed('https://fwinevietnam.vn/kien-thuc-ruou/feed/')
      .subscribe((data: any[]) => {
        this.articles = data;
      });
  }
}