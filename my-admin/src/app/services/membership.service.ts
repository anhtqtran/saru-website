import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Membership } from '../classes/membership';

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  http=inject(HttpClient);
  constructor() { }

  getMemberships(){
    return this.http.get<Membership[]>('http://localhost:4000/memberships');
  }
  getMembershipById(id:string){
    return this.http.get<Membership>('http://localhost:4000/memberships/'+id);
  }
  addMembership(data: any){
    return this.http.post('http://localhost:4000/memberships', data);
  }
  updateMembership(id: string, data: any){
    return this.http.put('http://localhost:4000/memberships/' + id, data);
  }
  deleteMembershipById(id:string){
    return this.http.delete('http://localhost:4000/memberships/'+id);
  }
}
