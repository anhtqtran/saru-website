import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Category } from '../types/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  http=inject(HttpClient);
  constructor() { }

  getCategories(){
    return this.http.get<Category[]>('http://localhost:4001/category');
  }
  getCategoryById(id:string){
    return this.http.get<Category>('http://localhost:4001/category/'+id);
  }
  addCategory(name:string){
    return this.http.post('http://localhost:4001/category',{
    name: name,
  });
  }
  updateCategory(id: string, name:string){
    return this.http.put('http://localhost:4001/category/'+id,{
    name: name,
  });
  }
  deleteCategoryById(id:string){
    return this.http.delete('http://localhost:4001/category/'+id);
  }
}
