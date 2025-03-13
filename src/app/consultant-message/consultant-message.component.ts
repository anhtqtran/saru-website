import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { SocketService } from "../services/socket.service";

@Component({
  selector: 'app-consultant-message',
  standalone: false,
  templateUrl: './consultant-message.component.html',
  styleUrl: './consultant-message.component.css'
})
export class ConsultantMessageComponent implements OnInit, OnDestroy {
  allChats: {
    name: string;
    lastMessage: string;
    messages: { user: string; message: string; targetUser?: string }[];
    unreadCount: number;
  }[] = [];
  filteredChats: {
    name: string;
    lastMessage: string;
    messages: { user: string; message: string; targetUser?: string }[];
    unreadCount: number;
  }[] = []; // Danh sách đã lọc để hiển thị
  activeIndex: number = -1;
  replyMessage: string = "";
  showEmojiPicker: boolean = false;
  emojis: string[] = ['😊', '😂', '👍', '❤️', '😢', '😡', '🎉', '🙌', '🤓', '✨'];
  selectedFile: File | null = null;
  searchTerm: string = ''; // Từ khóa tìm kiếm

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.registerUser("Admin");

    this.socketService.getMessages().subscribe((messages: { user: string; message: string; targetUser?: string }[]) => {
      console.log("Tin nhắn từ MongoDB (admin):", messages);
      const customerChats = new Map<string, { user: string; message: string; targetUser?: string }[]>();

      messages.forEach((data) => {
        if (data.user !== "Admin") {
          const customerName = data.user;
          if (!customerChats.has(customerName)) {
            customerChats.set(customerName, []);
          }
          customerChats.get(customerName)!.push(data);
        } else {
          const customerName = data.targetUser;
          if (customerName && !customerChats.has(customerName)) {
            customerChats.set(customerName, []);
          }
          if (customerName) {
            customerChats.get(customerName)!.push(data);
          }
        }
      });

      this.allChats = Array.from(customerChats.entries()).map(([name, messages]) => ({
        name,
        lastMessage: messages[messages.length - 1]?.message || "",
        messages,
        unreadCount: 0
      }));
      this.filteredChats = [...this.allChats]; // Khởi tạo filteredChats
      console.log("Danh sách cuộc trò chuyện (admin):", this.allChats);
      this.allChats = [...this.allChats];
    });

    this.socketService.onReceiveMessage().subscribe((data: { user: string; message: string; targetUser?: string }) => {
      console.log("📥 Tin nhắn nhận được (admin):", data);
      if (data.user === "Admin") {
        console.log("Bỏ qua tin nhắn của admin");
        return;
      }

      const existingChat = this.allChats.find((chat) => chat.name === data.user);
      if (existingChat) {
        if (!existingChat.messages.some((msg) => msg.message === data.message && msg.user === data.user)) {
          existingChat.messages.push(data);
          existingChat.lastMessage = data.message;
          if (this.activeIndex !== this.allChats.indexOf(existingChat)) {
            existingChat.unreadCount += 1;
          }
        }
      } else {
        const newChat = {
          name: data.user || "Khách hàng",
          lastMessage: data.message,
          messages: [data],
          unreadCount: 1
        };
        this.allChats.push(newChat);
      }
      this.filterChats(); // Cập nhật danh sách lọc khi có tin nhắn mới
    });
  }

  setActiveChat(index: number): void {
    this.activeIndex = index;
    this.replyMessage = '';
    this.showEmojiPicker = false;
    this.selectedFile = null;
    if (this.filteredChats[index]) {
      this.filteredChats[index].unreadCount = 0;
      const originalIndex = this.allChats.findIndex(chat => chat.name === this.filteredChats[index].name);
      if (originalIndex !== -1) {
        this.allChats[originalIndex].unreadCount = 0;
      }
      this.allChats = [...this.allChats];
      this.filteredChats = [...this.filteredChats];
    }
  }

  sendReply(): void {
    if (this.activeIndex >= 0) {
      const targetUser = this.allChats[this.activeIndex].name;
      const existingChat = this.allChats[this.activeIndex];

      if (this.replyMessage.trim()) {
        const replyData: { user: string; message: string; targetUser: string } = { 
          user: "Admin", 
          message: this.replyMessage,
          targetUser: targetUser
        };
        console.log("Tin nhắn gửi đi (admin):", replyData);
        if (!existingChat.messages.some((msg) => msg.message === replyData.message && msg.user === replyData.user)) {
          existingChat.messages.push({ user: replyData.user, message: replyData.message, targetUser: replyData.targetUser });
          existingChat.lastMessage = replyData.message;
        }
        this.socketService.sendMessage(replyData);
      }

      this.replyMessage = "";
      this.allChats = [...this.allChats];
      this.filterChats(); // Cập nhật danh sách lọc sau khi gửi
      this.showEmojiPicker = false;
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string): void {
    this.replyMessage += emoji;
    this.showEmojiPicker = false;
  }

  insertText(): void {
    const defaultText = ' [Đoạn văn bản mẫu] ';
    this.replyMessage += defaultText;
  }

  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    } else {
      console.error('fileInput không tồn tại!');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.replyMessage += ` [Hình ảnh: ${this.selectedFile.name}] `;
      input.value = '';
    }
  }

  // Hàm lọc danh sách khách hàng dựa trên từ khóa
  filterChats(): void {
    if (!this.searchTerm.trim()) {
      this.filteredChats = [...this.allChats]; // Nếu không có từ khóa, hiển thị toàn bộ danh sách
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredChats = this.allChats.filter(chat => 
        chat.name.toLowerCase().includes(term) || 
        chat.lastMessage.toLowerCase().includes(term)
      );
    }
    // Cập nhật activeIndex nếu khách hàng đang chọn không còn trong danh sách lọc
    if (this.activeIndex >= 0 && this.filteredChats.length > 0) {
      const currentChat = this.allChats[this.activeIndex];
      const newIndex = this.filteredChats.findIndex(chat => chat.name === currentChat.name);
      this.activeIndex = newIndex !== -1 ? newIndex : -1;
    } else if (this.filteredChats.length === 0) {
      this.activeIndex = -1;
    }
  }
}