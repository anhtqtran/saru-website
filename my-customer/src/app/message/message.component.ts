import { Component, OnInit, OnDestroy } from "@angular/core";
import { SocketService, Message, SendMessageData } from "../services/socket.service";

@Component({
  selector: 'app-message',
  standalone: false,
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, OnDestroy {
  isChatOpen: boolean = false;
  message: string = "";
  messages: Message[] = [];
  customerName: string = "Khách hàng";

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.registerUser(this.customerName);

    this.socketService.getMessages().subscribe({
      next: (data) => {
        this.messages = data.filter(
          (msg) => msg.user === this.customerName || (msg.user === "Admin" && msg.targetUser === this.customerName)
        );
      },
      error: (err) => {
        console.error('Lỗi khi lấy tin nhắn:', err);
      }
    });

    this.socketService.onReceiveMessage().subscribe({
      next: (data) => {
        if (data.user === "Admin" && data.targetUser === this.customerName) {
          this.messages.push(data);
          this.messages = [...this.messages];
        } else if (data.user === this.customerName) {
          this.messages.push(data);
          this.messages = [...this.messages];
        }
      },
      error: (err) => {
        console.error('Lỗi khi nhận tin nhắn:', err);
      }
    });
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage(): void {
    if (this.message.trim()) {
      const newMessage: SendMessageData = { 
        user: this.customerName, 
        message: this.message,
        targetUser: "Admin"
      };
      // Thêm tin nhắn vào danh sách với kiểu Message (thêm timestamp giả lập nếu cần)
      const displayMessage: Message = {
        ...newMessage,
        timestamp: new Date().toISOString() // Giả lập timestamp cho hiển thị
      };
      this.messages.push(displayMessage);
      this.socketService.sendMessage(newMessage);
      this.message = "";
      this.messages = [...this.messages];
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}