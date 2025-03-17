import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FaqService } from '../../services/faq.service';

@Component({
  selector: 'app-faqdetail',
  standalone: false,
  templateUrl: './faqdetail.component.html',
  styleUrl: './faqdetail.component.css'
})
export class FaqdetailComponent {
  formBuilder = inject(FormBuilder);
    faqForm = this.formBuilder.group({
      FaqID: [null, [Validators.required, Validators.minLength(5)]],
      FaqTitle: [null, [Validators.required, Validators.minLength(5)]],
      FaqContent: [null, [Validators.required, Validators.minLength(50)]],
    });
    id!:string;
    route=inject(ActivatedRoute);
    faqService=inject(FaqService);
    ngOnInit() {
      this.id=this.route.snapshot.params["id"];
      console.log(this.id);
      if(this.id) {
        this.faqService.getFaqById(this.id).subscribe((result: any)=>{
          console.log(result);
          this.faqForm.patchValue(result as any);
        });
      }
    }
    router=inject(Router);
    addFaq() {
      console.log("Thêm FAQ mới..."); // Debug xem có chạy vào đây không
  
      let value = this.faqForm.value;
      console.log("Dữ liệu gửi đi:", value); // Kiểm tra dữ liệu form
  
      this.faqService.addFaq(value as any).subscribe({
          next: (result) => {
              alert('Thêm FAQ thành công');
              this.router.navigate(['/admin/faqs']);
          },
          error: (err) => {
              console.error("Lỗi khi thêm FAQ:", err);
              alert("Có lỗi xảy ra khi thêm FAQ");
          }
      });
  }
  updateFaq(){
    let value = this.faqForm.value;
    console.log(value);
    this.faqService.updateFaq(this.id, value as any).subscribe((result) => {
      alert('Cập nhật FAQ thành công');
      this.router.navigate(['/admin/faqs']);
  });
  }
  toggleAdminMenu(): void {
    console.log('Admin menu toggled');
  }
}