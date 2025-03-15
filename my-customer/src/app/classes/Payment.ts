export class PaymentInfo {
    fullName: string = '';
    phoneNumber: string = '';
    selectedProvince: string = '';
    address: string = '';
  
    errorMessages: any = {
      fullName: '',
      phoneNumber: '',
      selectedProvince: '',
      address: ''
    };
  
    constructor() {}
  
    validate(): boolean {
        let isValid = true;
      
        // Kiểm tra họ và tên
        if (!this.fullName?.trim()) {
          this.errorMessages.fullName = 'Vui lòng nhập họ và tên!';
          isValid = false;
        } else {
          this.errorMessages.fullName = '';
        }
      
        // Kiểm tra số điện thoại
        const phoneRegex = /^(?:\+84|0)\d{9}$/;
        if (!this.phoneNumber?.trim()) {
          this.errorMessages.phoneNumber = 'Vui lòng nhập số điện thoại!';
          isValid = false;
        } else if (!phoneRegex.test(this.phoneNumber)) {
          this.errorMessages.phoneNumber = 'Số điện thoại không hợp lệ!';
          isValid = false;
        } else {
          this.errorMessages.phoneNumber = '';
        }
      
        // Kiểm tra địa điểm (tỉnh/thành phố)
        if (!this.selectedProvince) {
          this.errorMessages.selectedProvince = 'Vui lòng chọn địa điểm!';
          isValid = false;
        } else {
          this.errorMessages.selectedProvince = '';
        }
      
        // Kiểm tra địa chỉ cụ thể
        if (!this.address?.trim()) {
          this.errorMessages.address = 'Vui lòng nhập địa chỉ cụ thể!';
          isValid = false;
        } else {
          this.errorMessages.address = '';
        }
      
        // 🔥 LOG để kiểm tra lỗi còn sót
        console.log("Lỗi còn lại:", this.errorMessages);
      
        return isValid;
      }
      
  }
  