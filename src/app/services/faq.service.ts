import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Faq } from '../classes/faq';


@Injectable({
  providedIn: 'root'
})
export class FaqService {
  http=inject(HttpClient);
  constructor() { }

  getAllFaqs(){
    return this.http.get<Faq[]>('http://localhost:3000/faqs');
  }
  getFaqById(id:string){
    return this.http.get<Faq>('http://localhost:3000/faqs/'+id);
  }
  addFaq(model: Faq){
    return this.http.post('http://localhost:3000/faqs', model);
  }
  updateFaq(id: string, model: Faq){
    return this.http.put('http://localhost:3000/faqs/'+id, model);
  }
  deleteFaqById(id:string){
    return this.http.delete('http://localhost:3000/faqs/'+id);
  }
}
    