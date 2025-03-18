<<<<<<< HEAD
=======
export interface RelatedProduct {
  _id: string;
  ProductName: string;
  ProductPrice: number;
  ProductImageCover?: string; // Thêm để chuẩn bị cho dữ liệu mới
}

>>>>>>> main
export class Product {
  constructor(
    public _id: any = null,
    public ProductID: string = '',
    public CateID: string = '',
    public PromotionID?: string,
    public ImageID: string = '',
    public ProductName: string = '',
    public ProductPrice: number = 0,
    public ProductBrand: string = '',
    public ProductNetContent: string = '',
    public ProductFullDescription: string = '',
    public ProductShortDescription: string = '',
    public ProductSKU: string = '',
    public WineVolume?: string,
    public WineType?: string,
    public WineIngredient?: string,
    public WineFlavor?: string,
<<<<<<< HEAD
    public condition?: string, // Thêm trường condition
=======
    public condition?: string,
>>>>>>> main
    public ProductImageCover?: string,
    public ProductImageSub1?: string,
    public ProductImageSub2?: string,
    public ProductImageSub3?: string,
<<<<<<< HEAD
    public averageRating?: number, // Thêm trường đánh giá trung bình
    public totalReviewCount?: number, // Thêm tổng số đánh giá
    public reviews?: Array<any>, // Thêm danh sách đánh giá (tùy chọn chi tiết)
    public relatedProducts?: Array<any> // Thêm danh sách sản phẩm liên quan
=======
    public averageRating?: number,
    public totalReviewCount?: number,
    public reviews?: Array<any>,
    public relatedProducts?: RelatedProduct[], // Cập nhật thành mảng RelatedProduct
    public CateName?: string,
    public reviewCount?: number,
    public description?: string,
    public currentPrice: number = 0,
    public stockStatus?: string,
    public isOnSale?: boolean,
    public isPromotion?: boolean,
    public PromotionValue?: number,
    public originalPrice: number = 0,
    public discountPercentage: number = 0
>>>>>>> main
  ) {}
}

export class Pagination {
  constructor(
    public currentPage: number = 1,
    public totalPages: number = 1,
    public totalItems: number = 0
  ) {}
}