export interface Customer {
    _id?: string;
    CustomerID: string;
    CustomerName: string;
    MemberID: string;  // ✅ Dùng `string` thay vì `String`
    CustomerAdd: string;
    CustomerPhone: string;
    CustomerBirth: string;
    CustomerAvatar: string;
    ReceiveEmail: boolean;
  }