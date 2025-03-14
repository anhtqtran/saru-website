import { Component } from '@angular/core';

@Component({
  selector: 'app-accountmanage',
  standalone: false,
  templateUrl: './accountmanage.component.html',
  styleUrl: './accountmanage.component.css'
})
export class AccountmanageComponent {
  email = 'anhtt@st.uel.edu.vn';
  addresses: any[] = [
    { name: 'Trần Thanh Quế Anh', phone: '0123456789', address: 'Số 669, QL1, Khu phố 3, Phường Linh Xuân, Quận Thủ Đức, TP. Hồ Chí Minh', isDefault: true, isEditing: false },
    { name: 'Trần Thục Doan', phone: '0324546023', address: 'Ký túc xá khu B, khu phố Tân Hòa, TP. Dĩ An, Bình Dương', isDefault: false, isEditing: false }
  ];

  addAddress() {
    this.addresses.push({ name: '', phone: '', address: '', isDefault: false, isEditing: true });
  }

  removeAddress(index: number) {
    this.addresses.splice(index, 1);
  }

  enableEdit(index: number) {
    this.addresses[index].isEditing = true;
    setTimeout(() => {
      const inputElement = document.querySelector(`#name-${index}`) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  }

  saveEdit(index: number) {
    this.addresses[index].isEditing = false;
  }

  setDefaultAddress(index: number) {
    // Đặt tất cả địa chỉ khác thành không mặc định
    this.addresses.forEach((address, i) => {
      address.isDefault = i === index;
    });
  }
}