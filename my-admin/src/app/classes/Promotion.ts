export interface Promotion {
  _id?: string;
  type: 'promotion' | 'voucher';
  id: string;
  startDate: string;
  endDate: string;
  conditionId: number;
  conditionStatus: string;
  quantity?: number;
  remainingQuantity?: number;
  value: number;
  limitPerUser?: number;
  status: string;
  SCOPEID: number;
  ScopeName?: string;
}

interface PromotionScope {
  SCOPEID: number;
  SCOPE: string;
}

export interface Voucher {
  _id?: string;
  VoucherID: string;
  VoucherStartDate: string;
  VoucherExpiredDate: string;
  VoucherConditionID: string;
  VoucherQuantity: number;
  VoucherValue: number;
  RemainingQuantity?: number;
  UsedCount?: number;
  SCOPEID: number; 
  ScopeName?: string;
  type?: 'voucher';
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