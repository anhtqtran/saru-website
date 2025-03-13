import { Component, OnInit, OnDestroy } from "@angular/core";
import { SocketService } from "../services/socket.service";

@Component({
  selector: 'app-message',
  standalone: false,
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit, OnDestroy {
  isChatOpen: boolean = false;
  message: string = "";
  messages: { user: string; message: string; targetUser?: string }[] = [];
  customerName: string = "Khách hàng"; // Thay đổi theo tên khách hàng thực tế

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    // Đăng ký tên khách hàng
    this.socketService.registerUser(this.customerName);

    // 🔥 Lấy tin nhắn từ MongoDB khi mở lại trang
    this.socketService.getMessages().subscribe((data: { user: string; message: string; targetUser?: string }[]) => {
      console.log("Tin nhắn từ MongoDB (khách hàng):", data);
      // Lọc tin nhắn liên quan đến khách hàng hiện tại
      this.messages = data.filter(
        (msg) => msg.user === this.customerName || (msg.user === "Admin" && msg.targetUser === this.customerName)
      );
      console.log("Tin nhắn sau khi lọc (khách hàng):", this.messages);
      this.messages = [...this.messages]; // Cập nhật giao diện
    });

    // 🔥 Nhận tin nhắn từ Admin hoặc chính khách hàng
    this.socketService.onReceiveMessage().subscribe((data: { user: string; message: string; targetUser?: string }) => {
      console.log("📥 Tin nhắn nhận được (khách hàng):", data);
      // Chỉ hiển thị tin nhắn liên quan đến khách hàng hiện tại
      if (data.user === "Admin" && data.targetUser === this.customerName) {
        this.messages.push(data);
        this.messages = [...this.messages];
      } else if (data.user === this.customerName) {
        this.messages.push(data);
        this.messages = [...this.messages];
      }
    });
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage(): void {
    if (this.message.trim()) {
      const newMessage: { user: string; message: string; targetUser: string } = { 
        user: this.customerName, 
        message: this.message,
        targetUser: "Admin" // Đảm bảo targetUser là "Admin"
      };
      console.log("Tin nhắn gửi đi (khách hàng):", newMessage); // Kiểm tra dữ liệu gửi đi
      this.messages.push(newMessage);
      this.socketService.sendMessage(newMessage);
      this.message = "";
      this.messages = [...this.messages];
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}