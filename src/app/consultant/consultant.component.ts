import { Component } from '@angular/core';

@Component({
  selector: 'app-consultant',
  standalone: false,
  templateUrl: './consultant.component.html',
  styleUrl: './consultant.component.css'
})
export class ConsultantComponent {
  searchText: string = '';
  hoveredIndex: number = -1;
  activeIndex: number = -1;

  chats = [
    { name: 'Nguyễn Văn An', phone: '0912345678', message: 'Shop có rượu táo mèo không?', time: '3 phút trước' },
    { name: 'Trần Thị Bích', phone: '0923456789', message: 'Rượu mận Mộc Châu giá bao nhiêu?', time: '5 phút trước' },
    { name: 'Lê Minh Tuấn', phone: '0934567890', message: 'Có rượu sắn dây không shop?', time: '8 phút trước' },
    { name: 'Phạm Hoàng Nam', phone: '0945678901', message: 'Rượu sâu chít còn hàng không?', time: '10 phút trước' },
    { name: 'Đặng Thị Kim', phone: '0956789012', message: 'Mình cần rượu ong khoái.', time: '12 phút trước' },
    { name: 'Bùi Văn Quang', phone: '0967890123', message: 'Shop có rượu dâu tằm không?', time: '15 phút trước' },
    { name: 'Hoàng Gia Bảo', phone: '0978901234', message: 'Rượu ngô Bắc Hà giá sao shop?', time: '18 phút trước' },
    { name: 'Nguyễn Thị Thanh', phone: '0989012345', message: 'Mua rượu Shan Lùng thế nào?', time: '20 phút trước' },
    { name: 'Vũ Đình Hưng', phone: '0990123456', message: 'Có rượu chuối hột không ạ?', time: '22 phút trước' },
    { name: 'Trương Văn Phúc', phone: '0901234567', message: 'Rượu nếp cẩm còn hàng không?', time: '25 phút trước' },
    { name: 'Nguyễn Hoài Nam', phone: '0912345679', message: 'Mình cần 2 chai rượu táo mèo.', time: '27 phút trước' },
    { name: 'Phạm Văn Kiên', phone: '0923456798', message: 'Shop có rượu đinh lăng không?', time: '30 phút trước' },
    { name: 'Lý Minh Huy', phone: '0934567987', message: 'Có rượu rừng Tây Bắc không shop?', time: '32 phút trước' },
    { name: 'Đặng Thị Loan', phone: '0945679876', message: 'Mua rượu ba kích ở đâu?', time: '35 phút trước' },
    { name: 'Lê Thị Dung', phone: '0956789765', message: 'Rượu hoẵng ngâm giá bao nhiêu?', time: '38 phút trước' },
    { name: 'Bùi Văn Hải', phone: '0967897654', message: 'Có rượu mắc khén không shop?', time: '40 phút trước' },
    { name: 'Trần Đình Thái', phone: '0978906543', message: 'Mình cần rượu sơn tra.', time: '42 phút trước' },
    { name: 'Nguyễn Hữu Phước', phone: '0989015432', message: 'Rượu hạt dổi còn không shop?', time: '45 phút trước' },
    { name: 'Võ Thanh Tú', phone: '0990124321', message: 'Có rượu tỏi đen không shop?', time: '48 phút trước' },
    { name: 'Đỗ Minh Châu', phone: '0901233210', message: 'Shop có rượu măng đen không?', time: '50 phút trước' }
  ];

  filteredChats() {
    return this.chats.filter(chat => 
      chat.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  setActiveChat(index: number) {
    this.activeIndex = index;
  }
}
