export interface BestSellingProduct {
  productNetContent: string;
  CateID: string; // Nếu cần, nếu không thì có thể loại bỏ
  _id: any;
  productId: string;
  productName: string;
  productPrice: number;
  productImageCover: string;
  categoryName: string;
  totalQuantity: number;
  reviewCount: number;
  averageRating: number;
  reviews?: any[];
  description?: string; // Thêm tùy chọn
  relatedProducts?: any[];
  ProductBrand?: string;
  ProductShortDescription?: string;
  ProductFullDescription?: string;
  ProductSKU?: string;
  ImageID?: string;

   // Thêm tùy chọn

}