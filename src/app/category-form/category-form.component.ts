import { Component, inject } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category-form',
  standalone: false,
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css'
})
export class CategoryFormComponent {
  name!: string;
  categoryService = inject(CategoryService);
  router=inject(Router);
  route=inject(ActivatedRoute);
  isEdit=false;
  id!: string;

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.isEdit=true;
      this.categoryService.getCategoryById(this.id).subscribe((result: any) => {
        console.log(result);
        this.name = result.name;
      });
    }
  }
  add() {
    console.log(this.name);
    this.categoryService.addCategory(this.name).subscribe((result:any) => {
      alert('Category added successfully');
      this.router.navigate(['/admin/categories']);
  })
}
  update(){
    console.log(this.name);
    this.categoryService.updateCategory(this.id,this.name).subscribe((result:any) => {
      alert('Category updated successfully');
      this.router.navigate(['/admin/categories']);
    });
  }
}
