export interface Product {
    _id: string; // MongoDB ObjectId, trong TypeScript có thể biểu diễn dưới dạng string
    productName: string;
    productCategory: string;
    productPrice: number; // Int32, theo dữ liệu mẫu là số nguyên
    productDiscountPercentage: number; // Int32, theo dữ liệu mẫu là số nguyên
    productBrand: string;
    productNetContent: string;
    productImageCover: string;
    productImageSub1: string;
    productImageSub2: string;
    productImageSub3: string;
    productFullDescription: string;
    productShortDescription: string;
    productSKU: string;
    productStock: number; // Int32, theo dữ liệu mẫu là số nguyên
    productRating: number; // Decimal128, có thể biểu diễn dưới dạng number trong TypeScript
    productReviewCount: number; // Int32, theo dữ liệu mẫu là số nguyên
    wineVolume: string; // Ví dụ: "19%"
    wineType: string;
    wineIngredient: string;
    wineFlavor: string;
  }