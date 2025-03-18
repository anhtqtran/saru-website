import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { Category } from '../../classes/category';
import { CategoryService } from '../../services/category.service';
import { BlogService } from '../../services/blog.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as Quill from 'quill';  // ✅ Import Quill để đăng ký theme và modules

@Component({
  selector: 'app-blogdetail',
  standalone: false,
  templateUrl: './blogdetail.component.html',
  styleUrl: './blogdetail.component.css'
})
export class BlogdetailComponent {
  formBuilder = inject(FormBuilder);
  blogForm = this.formBuilder.group({
    BlogID: ['', [Validators.required, Validators.minLength(5)]],
    BlogTitle: ['', [Validators.required, Validators.minLength(5)]], // ✅ Dùng `''` thay vì `null`
    BlogContent: ['', [Validators.required, Validators.minLength(50)]], // ✅ Được liên kết với Quill Editor
    BlogImage: this.formBuilder.array([]),
    categoryID: ['', [Validators.required]], 
  });
  categories:Category[] = [];
  id!:string;
  route=inject(ActivatedRoute);
  categoryService = inject(CategoryService);
  blogService=inject(BlogService);

  ngOnInit() {
    if (typeof window !== 'undefined') {
      (window as any).Quill = Quill; // Đăng ký Quill vào `window`
    }
  
    // Lấy danh sách danh mục
    this.categoryService.getCategories().subscribe((result) => {
      this.categories = result; // Lưu danh sách danh mục để hiển thị
  
      // Sau khi có danh mục, lấy dữ liệu bài viết
      this.id = this.route.snapshot.params["id"];
      if (this.id) {
        this.blogService.getBlogById(this.id).subscribe((result) => {
          // Thêm ảnh vào form array
          for (let index = 0; index < result.BlogImage.length; index++) {
            this.addBlogImage();
          }
  
          // Gán giá trị vào form
          const blogData = {
            BlogID: String(result.BlogID), // Đảm bảo là string
            BlogTitle: String(result.BlogTitle), // Đảm bảo là string
            BlogContent: String(result.BlogContent), // Đảm bảo là string
            categoryID: String(result.categoryID), // Ép kiểu về string
            BlogImage: result.BlogImage as string[]
          };
          this.blogForm.patchValue(blogData);
        });
      } else {
        this.addBlogImage();
      }
    });
  }
  router=inject(Router);
  addBlog() {
    let value = this.blogForm.value;
    console.log("Dữ liệu gửi lên Backend:", value); // Kiểm tra dữ liệu gửi đi

    this.blogService.addBlog(value as any).subscribe({
        next: (result) => {
            alert('Thêm bài viết thành công');
            this.router.navigate(['/admin/blogs']);
        },
        error: (err) => {
            console.error("Lỗi khi thêm bài viết:", err);
        }
    });
  }
  updateBlog(){
    let value = this.blogForm.value;
    console.log(value);
    this.blogService.updateBlog(this.id, value as any).subscribe((result) => {
      alert('Cập nhật bài viết thành công');
      this.router.navigate(['/admin/blogs']);
  });
  }
  
  addBlogImage(){
    this.BlogImage.push(this.formBuilder.control(null));
  }
  removeBlogImage(){
    this.BlogImage.removeAt(this.BlogImage.controls.length - 1);
  }
  get BlogImage(){
    return this.blogForm.get('BlogImage') as FormArray;
  } 
  toggleAdminMenu(): void {
    console.log('Admin menu toggled');
  } 
}