import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductStock, Product } from '../classes/Inventory';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private stockApiUrl = 'http://localhost:4000/api/productstocks';
  private productApiUrl = 'http://localhost:4000/api/products-full-details';
  private filtersUrl = 'http://localhost:4000/api/filters';

  constructor(private http: HttpClient) {}

  getFilters(): Observable<any> {
    return this.http.get<any>(this.filtersUrl);
  }

  getStockData(): Observable<ProductStock[]> {
    return this.http.get<ProductStock[]>(this.stockApiUrl);
  }

  getProducts(): Observable<{ data: Product[] }> {
    return this.http.get<{ data: Product[] }>(this.productApiUrl);
  }
  updateStockQuantity(productId: string, newQuantity: number): Observable<any> {
    const url = `${this.stockApiUrl}/${productId}`;  // Sử dụng _id từ MongoDB
    return this.http.put(url, { StockQuantity: newQuantity });
  }
  getFilteredStockData(CateName?: string, ProductBrand?: string): Observable<ProductStock[]> {
    let params: any = {};
  
    if (CateName) {
      params.CateName = CateName;
    }
    if (ProductBrand) {
      params.ProductBrand = ProductBrand;
    }
  
    return this.http.get<ProductStock[]>(this.stockApiUrl, { params });
  }
  
  
}


