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
    public condition?: string,
    public ProductImageCover?: string,
    public ProductImageSub1?: string,
    public ProductImageSub2?: string,
    public ProductImageSub3?: string,
    public averageRating?: number, // Có trong cả hai nhánh
    public totalReviewCount?: number, // Có trong cả hai nhánh
    public reviews?: Array<any>, // Có trong cả hai nhánh
    public relatedProducts?: Array<any>, // Có trong cả hai nhánh
    public CateName?: string, // Từ HEAD
    public reviewCount?: number, // Từ HEAD
    public description?: string, // Từ HEAD
    public currentPrice: number = 0, // Từ main
    public stockStatus?: string, // Từ main
    public isOnSale?: boolean, // Từ main
    public isPromotion?: boolean, // Từ main
    public PromotionValue?: number, // Từ main
    public originalPrice: number = 0, // Từ main
    public discountPercentage: number = 0 // Từ main
  ) {}
}

export class Pagination {
  constructor(
    public currentPage: number = 1,
    public totalPages: number = 1,
    public totalItems: number = 0
  ) {}
}