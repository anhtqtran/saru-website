import { inject, Injectable } from '@angular/core';
import { Customer } from '../classes/customer';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  http=inject(HttpClient);
  constructor() { }

  getAllCustomer(){
    return this.http.get<Customer[]>('http://localhost:3000/customers');
  }
  getCustomerById(id:string){
    return this.http.get<Customer>('http://localhost:3000/customers/'+id);
  }
  addCustomer(model: Customer){
    return this.http.post('http://localhost:3000/customers', model);
  }
  updateCustomer(id: string, model: Customer){
    return this.http.put('http://localhost:3000/customers/'+id, model);
  }
  deleteCustomerById(id:string){
    return this.http.delete('http://localhost:3000/customers/'+id);
  }
}
  
