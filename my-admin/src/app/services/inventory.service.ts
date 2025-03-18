import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductStock, Product } from '../classes/Inventory';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private stockApiUrl = 'http://localhost:4000/api/productstocks';
  private productApiUrl = 'http://localhost:4000/api/products';

  constructor(private http: HttpClient) {}

  getStockData(): Observable<ProductStock[]> {
    return this.http.get<ProductStock[]>(this.stockApiUrl);
  }

  getProducts(): Observable<{ data: Product[] }> {
    return this.http.get<{ data: Product[] }>(this.productApiUrl);
  }
}


