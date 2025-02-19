import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-editproduct',
  templateUrl: './editproduct.component.html',
  styleUrls: ['./editproduct.component.css']
})
export class EditproductComponent implements AfterViewInit {

  @ViewChild('togglePromo', { static: false }) togglePromo!: ElementRef<HTMLInputElement>;
  @ViewChild('toggleText', { static: false }) toggleText!: ElementRef<HTMLElement>;
  @ViewChild('toggleOutOfStock', { static: false }) toggleOutOfStock!: ElementRef<HTMLInputElement>;
  @ViewChild('toggleText2', { static: false }) toggleText2!: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    console.log("togglePromo:", this.togglePromo); 
    console.log("toggleOutOfStock:", this.toggleOutOfStock);
  
    if (this.togglePromo && this.toggleText) {
      this.togglePromo.nativeElement.addEventListener("change", () => {
        console.log("togglePromo changed:", this.togglePromo.nativeElement.checked);
        this.toggleText.nativeElement.innerText = this.togglePromo.nativeElement.checked ? "Có" : "Không";
        this.toggleText.nativeElement.style.color = this.togglePromo.nativeElement.checked ? "#ffb400" : "#999"; 
      });
    }
  
    if (this.toggleOutOfStock && this.toggleText2) {
      this.toggleOutOfStock.nativeElement.addEventListener("change", () => {
        console.log("toggleOutOfStock changed:", this.toggleOutOfStock.nativeElement.checked);
        this.toggleText2.nativeElement.textContent = this.toggleOutOfStock.nativeElement.checked ? "Có" : "Không";
        this.toggleText2.nativeElement.style.color = this.toggleOutOfStock.nativeElement.checked ? "#ffb400" : "#999";
      });
    }
  }
  
}
