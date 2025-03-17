import { CategoryService } from '../../services/category.service';
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category-form',
  standalone: false,
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css'
})
export class CategoryFormComponent {
  categoryService = inject(CategoryService);
  router=inject(Router);
  route=inject(ActivatedRoute);
  formBuilder = inject(FormBuilder);
  CateblogForm = this.formBuilder.group({
        CateblogID: [null, [Validators.required, Validators.minLength(5)]],
        CateblogName: [null, [Validators.required, Validators.minLength(5)]],
      });
      id!:string;
    ngOnInit() {
      this.id=this.route.snapshot.params["id"];
      console.log(this.id);
      if(this.id) {
        this.categoryService.getCategoryById(this.id).subscribe((result: any)=>{
          console.log(result);
          this.CateblogForm.patchValue(result as any);
        });
      }
    }
  addCategory() {
    console.log("Thêm danh mục mới...");

    let value = this.CateblogForm.value;
    console.log("Dữ liệu gửi đi:", value); // Debug dữ liệu

    this.categoryService.addCategory(value).subscribe({
        next: (result) => {
            alert('Thêm danh mục thành công');
            this.router.navigate(['/admin/categories-blog']);
        },
        error: (err) => {
            console.error("Lỗi khi thêm danh mục:", err);
            alert("Có lỗi xảy ra khi thêm danh mục");
        }
  });
  }  
  updateCategory(){
    let value = this.CateblogForm.value;
    console.log(value);
    this.categoryService.updateCategory(this.id, value as any).subscribe((result) => {
      alert('Cập nhật danh mục thành công');
      this.router.navigate(['/admin/categories-blog']);
  });
  }
}
