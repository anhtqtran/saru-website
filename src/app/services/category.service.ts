import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Category } from '../classes/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  http=inject(HttpClient);
  constructor() { }

  getCategories(){
    return this.http.get<Category[]>('http://localhost:3000/categories');
  }
  getCategoryById(id:string){
    return this.http.get<Category>('http://localhost:3000/categories/'+id);
  }
  addCategory(data: any){
    return this.http.post('http://localhost:3000/categories', data);
  }
  updateCategory(id: string, data: any){
    return this.http.put('http://localhost:3000/categories/' + id, data);
  }
  deleteCategoryById(id:string){
    return this.http.delete('http://localhost:3000/categories/'+id);
  }
}
