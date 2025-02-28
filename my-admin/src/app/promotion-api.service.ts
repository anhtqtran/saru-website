import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import {Promotion} from './models/Promotion';
@Injectable({
  providedIn: 'root'
})
export class PromotionApiService {
  private apiUrl = 'http://localhost:4002/promotions';
  constructor(private _http: HttpClient) { }
  getPromotions():Observable<any>
  {
  const headers=new HttpHeaders().set("Content-Type","text/plain;charset=utf-8")
  const requestOptions:Object={
  headers:headers,
  responseType:"text"
  }
  return this._http.get<any>("this.apiUrl",requestOptions).pipe(
  map(res=>JSON.parse(res) as Array<Promotion>),
  retry(3),
  catchError(this.handleError))
  }
  handleError(error:HttpErrorResponse){
  return throwError(()=>new Error(error.message))
  }
}
