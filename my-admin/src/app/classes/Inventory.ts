export interface ProductStock {
  _id: string;
  ProductID: string;
  CateID?: string;
  StockQuantity: number;
  ProductName: string; 
  ProductSKU: string;
  CateName:string;
  ProductBrand:string
}

export interface Product {
  _id: string;
  ProductID: string;
  ProductName: string;
  ProductSKU: string;
  ProductImageCover?: string;
  CateName:string;
  ProductBrand:string
  
}

export interface InventoryProduct extends ProductStock, Product {
  [key: string]: any
} // ✅ Kết hợp hai interface
