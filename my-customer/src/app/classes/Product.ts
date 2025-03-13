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
    public condition?: string, // Thêm trường condition
    public ProductImageCover?: string,
    public ProductImageSub1?: string,
    public ProductImageSub2?: string,
    public ProductImageSub3?: string,
    public averageRating?: number, // Thêm trường đánh giá trung bình
    public totalReviewCount?: number, // Thêm tổng số đánh giá
    public reviews?: Array<any>, // Thêm danh sách đánh giá (tùy chọn chi tiết)
    public relatedProducts?: Array<any> // Thêm danh sách sản phẩm liên quan
  ) {}
}

export class Pagination {
  constructor(
    public currentPage: number = 1,
    public totalPages: number = 1,
    public totalItems: number = 0
  ) {}
}