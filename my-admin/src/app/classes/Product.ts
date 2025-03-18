export interface Product {
    _id: string;
    ProductID: string;
    CateID: string;
    ProductName: string;
    ProductPrice: number;
    ProductBrand: string;
    ProductShortDescription: string;
    ProductFullDescription: string;
    ProductSKU: string;
    StockQuantity: number;
    IsPromotion: boolean;
    AllowOutOfStock: boolean;
    WineType: string;
    WineVolume: string;
    ComparePrice: number;
    ProductImageCover: string;
    ProductImageSub1: string;
    ProductImageSub2: string;
    ProductImageSub3: string;
    CateName?: string; // Có thể có từ `/api/products-full-details`
    selected?: boolean;
  }