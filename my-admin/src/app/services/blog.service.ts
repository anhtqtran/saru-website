import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Blog } from '../classes/blog';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  http=inject(HttpClient);
  constructor() { }

  getAllBlogs(){
    return this.http.get<Blog[]>('http://localhost:4000/blogs');
  }
  getBlogById(id:string){
    return this.http.get<Blog>('http://localhost:4000/blogs/'+id);
  }
  addBlog(model: Blog){
    return this.http.post('http://localhost:4000/blogs', model);
  }
  updateBlog(id: string, model: Blog){
    return this.http.put('http://localhost:4000/blogs/'+id, model);
  }
  deleteBlogById(id:string){
    return this.http.delete('http://localhost:4000/blogs/'+id);
  }
}
  