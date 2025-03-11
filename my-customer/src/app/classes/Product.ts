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
    public averageRating?: number,
    public totalReviewCount?: number,
    public reviews?: Array<any>,
    public relatedProducts?: Array<any>,
    public currentPrice: number = 0,
    public stockStatus?: string,
    public isOnSale?: boolean,
    public isPromotion?: boolean,
    public PromotionValue?: number,
    public originalPrice: number = 0,
    public discountPercentage: number = 0 // Thêm trường này
  ) {}
}

export class Pagination {
  constructor(
    public currentPage: number = 1,
    public totalPages: number = 1,
    public totalItems: number = 0
  ) {}
}