import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-blogdetail',
  standalone: false,
  templateUrl: './blogdetail.component.html',
  styleUrl: './blogdetail.component.css'
})
export class BlogdetailComponent {
  //set title of page
  public constructor(private titleService: Title){
    this.titleService.setTitle("Rượu Mận: Đặc sản tình yêu và kí ức vùng trời Tây Bắc - SARU"); 
  }
}
