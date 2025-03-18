export interface Order {
  _id: string;
  OrderID: string;
  CustomerID: string;
  OrderDate: string; // Thêm thuộc tính OrderDate
  OrderStatusID: number;
  PaymentStatusID: number;
  TotalOrderAmount: number; // Thêm thuộc tính TotalOrderAmount
  items: { ProductID: string; ProductName: string; Quantity: number; Price: number }[];
  selected?: boolean;
  OrderStatusText?: string;
  PaymentStatusText?: string;
}



export interface OrderStatus {
    _id: string;
    OrderStatusID: number;
    Status: string;
  }

export interface PaymentStatus {
    _id: string;
    PaymentStatusID: number;
    PaymentStatus: string;
  }

