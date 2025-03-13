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
    categoryID: ['', [Validators.required]], // ✅ Để trống thay vì `null`
  });
  categories:Category[] = [];
  id!:string;
  route=inject(ActivatedRoute);
  categoryService = inject(CategoryService);
  blogService=inject(BlogService);
  ngOnInit() {
    if (typeof window !== 'undefined') {
      (window as any).Quill = Quill;  // ✅ Đăng ký Quill vào `window`
    }
    // ✅ Tải danh mục trước
    this.categoryService.getCategories().subscribe((result) => {
        this.categories = result;  // ✅ Lưu danh sách danh mục để hiển thị

        // ✅ Sau khi có danh mục, mới lấy dữ liệu bài viết
        this.id = this.route.snapshot.params["id"];
        if (this.id) {
            this.blogService.getBlogById(this.id).subscribe(result => {
                for (let index = 0; index < result.BlogImage.length; index++) {
                    this.addBlogImage();
                }

                const blogData = {
                  BlogID: String(result.BlogID),  // ✅ Ép thành string
                  BlogTitle: String(result.BlogTitle),
                  BlogContent: String(result.BlogContent),
                  categoryID: Array.isArray(result.categoryID) && result.categoryID.length
                      ? result.categoryID[0]._id
                      : "",
                  BlogImage: result.BlogImage as string[]  // ✅ Ép kiểu về mảng string[]
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
    console.log("Dữ liệu gửi lên Backend:", value); // ✅ Kiểm tra dữ liệu gửi đi

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
}