import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService, Message, SendMessageData } from "../services/socket.service";

@Component({
  selector: 'app-message',
  standalone: false,
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, OnDestroy {
  isChatOpen: boolean = false;
  message: string = '';
  messages: Message[] = [];
  customerName: string = 'Khách hàng';
  isEmojiPickerOpen: boolean = false;
  hasNewMessage: boolean = false;

  // Danh sách emoji (có thể mở rộng)
  emojis: string[] = [
    '😀', '😍', '😂', '😎', '😢', '😡', '👍', '👏', '❤️', '🔥',
    '😊', '😘', '🤩', '😴', '😱', '😤', '👀', '💪', '💕', '✨'
  ];

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.registerUser(this.customerName);

    this.socketService.getMessages().subscribe({
      next: (data) => {
        this.messages = data.filter(
          (msg) => msg.user === this.customerName || (msg.user === 'Admin' && msg.targetUser === this.customerName)
        );
      },
      error: (err) => {
        console.error('Lỗi khi lấy tin nhắn:', err);
      }
    });

    this.socketService.onReceiveMessage().subscribe({
      next: (data) => {
        if (data.user === 'Admin' && data.targetUser === this.customerName) {
          this.messages.push(data);
          if (!this.isChatOpen) {
            this.hasNewMessage = true; // Hiển thị badge khi có tin nhắn mới và chat chưa mở
          }
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
    if (this.isChatOpen) {
      this.hasNewMessage = false; // Ẩn badge khi mở chat
    }
  }

  toggleEmojiPicker(): void {
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
  }

  selectEmoji(emoji: string): void {
    this.message += emoji;
    this.isEmojiPickerOpen = false;
  }

  sendMessage(): void {
    if (this.message.trim()) {
      const newMessage: SendMessageData = { 
        user: this.customerName, 
        message: this.message,
        targetUser: 'Admin'
      };
      this.sendMessageToServer(newMessage);
    }
  }

  private sendMessageToServer(newMessage: SendMessageData): void {
    // Thêm tin nhắn vào danh sách với kiểu Message
    const displayMessage: Message = {
      ...newMessage,
      timestamp: new Date().toISOString()
    };
    this.messages.push(displayMessage);
    this.socketService.sendMessage(newMessage);
    this.message = '';
    this.messages = [...this.messages];
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}