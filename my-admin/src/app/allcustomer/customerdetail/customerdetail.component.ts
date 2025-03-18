import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Membership } from '../../classes/membership';
import { MembershipService } from '../../services/membership.service';
import { CustomerService } from '../../services/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../../classes/customer';
import { Order } from '../../classes/order';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-customerdetail',
  standalone: false,
  templateUrl: './customerdetail.component.html',
  styleUrl: './customerdetail.component.css'
})
export class CustomerdetailComponent {
  formBuilder = inject(FormBuilder);
  customerForm = this.formBuilder.group({
    CustomerID: ['', [Validators.required, Validators.minLength(5)]],
    CustomerName: ['', [Validators.required, Validators.minLength(3)]], 
    CustomerPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]], 
    CustomerBirth: ['', [Validators.required]],
    Address: ['', [Validators.required]],  
    City: ['', [Validators.required]],
    State: ['', [Validators.required]],
    PostalCode: ['', [Validators.required]],
    Country: ['', [Validators.required]],
    ReceiveEmail: [false],  
    MemberID: ['', [Validators.required]],
    CustomerAvatar: ['', [Validators.required]],
  });

  memberships: Membership[] = [];
  orders: Order[] = [];
  id!: string;
  route = inject(ActivatedRoute);
  router = inject(Router);

  membershipService = inject(MembershipService);
  customerService = inject(CustomerService);
  orderService = inject(OrderService);

  ngOnInit() {
    this.id = this.route.snapshot.params["id"];

    // ✅ Lấy danh sách memberships
    this.membershipService.getMemberships().subscribe((result) => {
      console.log("Danh sách Memberships:", result);
      this.memberships = result;
    }, error => {
      console.error("Lỗi khi lấy danh sách memberships:", error);
    });

    // ✅ Nếu có ID, lấy thông tin khách hàng
    if (this.id) {
        this.customerService.getCustomerById(this.id).subscribe((result: Customer) => {
            console.log("Dữ liệu từ API:", result);

            let addressData = {
                address: '',
                city: '',
                state: '',
                postalCode: '',
                country: ''
            };

            try {
                addressData = JSON.parse(result.CustomerAdd.replace(/'/g, '"')); // ✅ Chuyển JSON string thành Object
            } catch (error) {
                console.error("Lỗi khi parse CustomerAdd:", error);
            }

            // ✅ Chuyển đổi `Date` thành `YYYY-MM-DD` (định dạng phù hợp với Form)
            let birthDate = result.CustomerBirth ? new Date(result.CustomerBirth).toISOString().split('T')[0] : '';

            this.customerForm.patchValue({
                CustomerID: result.CustomerID ?? '',  
                CustomerName: result.CustomerName ?? '',
                CustomerPhone: result.CustomerPhone ?? '',
                CustomerBirth: birthDate,  // ✅ Chuyển `Date` thành `string`
                Address: addressData.address ?? '',
                City: addressData.city ?? '',
                State: addressData.state ?? '',
                PostalCode: addressData.postalCode ?? '',
                Country: addressData.country ?? '',
                ReceiveEmail: result.ReceiveEmail ?? false,  
                MemberID: result.MemberID ?? '',
                CustomerAvatar: result.CustomerAvatar ?? ''
              });

              // ✅ Lấy lịch sử đơn hàng của khách hàng
              this.getCustomerOrders(result.CustomerID);
          });
      }
    }

  saveCustomer() {
    let value = this.customerForm.value;
    
    // ✅ Chuyển đổi ngày sinh từ `string` về `Date`
    let formattedBirthDate = value.CustomerBirth ? new Date(value.CustomerBirth).toISOString() : '';

    // ✅ Gộp địa chỉ thành JSON string
    let customerAddString = JSON.stringify({
        address: value.Address ?? '',
        city: value.City ?? '',
        state: value.State ?? '',
        postalCode: value.PostalCode ?? '',
        country: value.Country ?? ''
    });

    let customerData: Customer = {
        CustomerID: value.CustomerID ?? '',
        CustomerName: value.CustomerName ?? '',
        CustomerPhone: value.CustomerPhone ?? '',
        CustomerBirth: formattedBirthDate,  // ✅ Chuyển `string` thành `Date` trước khi gửi API
        CustomerAdd: customerAddString,
        ReceiveEmail: value.ReceiveEmail ?? false,
        MemberID: value.MemberID ?? '',
        CustomerAvatar: value.CustomerAvatar ?? ''
    };

    console.log("Dữ liệu gửi lên API:", customerData);

    if (this.id) {
        this.customerService.updateCustomer(this.id, customerData).subscribe(() => {
            alert('Cập nhật khách hàng thành công');
            this.router.navigate(['/admin/customers']);
        });
    } else {
        this.customerService.addCustomer(customerData).subscribe(() => {
            alert('Thêm khách hàng thành công');
            this.router.navigate(['/admin/customers']);
        });
      }
    }
    // ✅ Hàm lấy lịch sử đơn hàng từ API
  getCustomerOrders(customerID: string) {
    this.orderService.getOrdersByCustomerID(customerID).subscribe((orders) => {
        this.orders = orders;
        console.log("Lịch sử đơn hàng:", this.orders);
    }, error => {
        console.error("Lỗi khi lấy đơn hàng:", error);
    });
  }

  // ✅ Chuyển đổi trạng thái đơn hàng thành chữ dễ đọc
  getStatusText(statusID: number): string {
    switch (statusID) {
      case 0: return "Chờ xác nhận";
      case 1: return "Đã xác nhận";
      case 2: return "Đã hủy đơn";
      case 3: return "Đang vận chuyển";
      case 4: return "Giao hàng thành công";
      default: return "Không xác định";
    }
  }
}

