export interface Order {
  _id?: string;                 // ObjectId từ MongoDB
  OrderID: string;              // Mã đơn hàng
  CustomerID: string;           // Mã khách hàng liên kết
  PaymentMethodID: number;      // Phương thức thanh toán (0: Tiền mặt, 1: Chuyển khoản, ...)
  PaymentStatusID: number;      // Trạng thái thanh toán (0: Chưa thanh toán, 1: Đã thanh toán)
  VoucherID?: string | null;    // Mã giảm giá (Có thể null hoặc chuỗi)
  OrderStatusID: number;        // Trạng thái đơn hàng (0: Đang xử lý, 1: Đã xác nhận, ...)
  OrderDate: string;            // Ngày đặt hàng (Lưu dạng chuỗi "YYYY-MM-DD")
}
