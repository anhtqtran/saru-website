export interface Promotion {
    _id: string;
    PromotionID: string;
    PromotionExpiredDate: string;
    PromotionStartDate: string;
    PromotionConditionID: number;
    PromotionValue: number;
  }
  
export interface Voucher {
  _id: string;
  VoucherID: string;
  VoucherExpiredDate: string;
  VoucherStartDate: string;
  VoucherConditionID: number;
  VoucherQuantity: number;
  VoucherValue: number;
  UsedCount: number;
  RemainingQuantity: number;
}

export interface PromotionStatus {
  _id: string;
  PromotionConditionID: number;
  PromotionStatus: string;
}

export interface VoucherStatus {
  _id: string;
  VoucherConditionID: number;
  VoucherStatus: string;
}

export interface Category {
  _id: string;
  CategoryID: string;
  CategoryName: string;
}