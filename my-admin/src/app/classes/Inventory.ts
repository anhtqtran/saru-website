export interface ProductStock {
  ProductID: string;
  CateID?: string;
  StockQuantity: number;
  ProductName: string; 
  ProductSKU: string;
}

export interface Product {
  ProductID: string;
  ProductName: string;
  ProductSKU: string;
  ProductImageCover?: string;
}

export interface InventoryProduct extends ProductStock, Product {} // ✅ Kết hợp hai interface
