import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-faqs',
  standalone: false,
  templateUrl: './faqs.component.html',
  styleUrl: './faqs.component.css'
})
export class FaqsComponent implements OnInit {
  faqs: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Gọi API để lấy danh sách FAQs từ MongoDB
    this.http.get('http://localhost:3000/faqs').subscribe(
      (response: any) => {
        this.faqs = response.map((faq: any) => ({
          _id: faq._id,
          title: faq.FaqTitle, // Ánh xạ FaqTitle từ MongoDB
          content: faq.FaqContent, // Ánh xạ FaqContent từ MongoDB
          open: false // Thêm trạng thái open mặc định
        }));
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách FAQs:', error);
      }
    );
  }

  toggleAccordion(item: any) {
    item.open = !item.open;
  }
}