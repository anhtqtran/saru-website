import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { SocketService } from "../services/socket.service";

@Component({
  selector: 'app-consultant',
  standalone: false,
  templateUrl: './consultant.component.html',
  styleUrls: ['./consultant.component.css']
})
export class ConsultantComponent implements OnInit, OnDestroy {
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
  }[] = [];
  activeIndex: number = -1;
  replyMessage: string = "";
  showEmojiPicker: boolean = false;
  emojis: string[] = ['😊', '😂', '👍', '❤️', '😢', '😡', '🎉', '🙌', '🤓', '✨'];
  searchTerm: string = '';
  emojiPickerLeft: number | null = null;

  @ViewChild('emojiButton') emojiButton!: ElementRef;

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
      this.filteredChats = [...this.allChats];
      console.log("Danh sách cuộc trò chuyện (admin):", this.allChats);
      this.allChats = [...this.allChats];
    });

    this.socketService.onReceiveMessage().subscribe((data: { user: string; message: string; targetUser?: string }) => {
      console.log("Tin nhắn nhận được (admin):", data);
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
      this.filterChats();
    });
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit - emojiButton:', this.emojiButton);
  }

  setActiveChat(index: number): void {
    this.activeIndex = index;
    this.replyMessage = '';
    this.showEmojiPicker = false;
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
      this.filterChats();
      this.showEmojiPicker = false;
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  toggleEmojiPicker(): void {
    console.log('Before toggle - showEmojiPicker:', this.showEmojiPicker);
    this.showEmojiPicker = !this.showEmojiPicker;
    console.log('After toggle - showEmojiPicker:', this.showEmojiPicker);
    if (this.showEmojiPicker && this.emojiButton) {
      const buttonRect = this.emojiButton.nativeElement.getBoundingClientRect();
      console.log('buttonRect:', buttonRect);
      this.emojiPickerLeft = buttonRect.left + (buttonRect.width / 2);
      console.log('emojiPickerLeft:', this.emojiPickerLeft);
    } else {
      this.emojiPickerLeft = null;
      console.log('emojiPickerLeft reset to null');
    }
  }

  addEmoji(emoji: string): void {
    this.replyMessage += emoji;
    this.showEmojiPicker = false;
  }

  insertText(): void {
    const defaultText = ' Xin chào! Chúng tôi có thể giúp gì cho bạn? ';
    this.replyMessage += defaultText;
  }

  filterChats(): void {
    if (!this.searchTerm.trim()) {
      this.filteredChats = [...this.allChats];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredChats = this.allChats.filter(chat =>
        chat.name.toLowerCase().includes(term) ||
        chat.lastMessage.toLowerCase().includes(term)
      );
    }
    if (this.activeIndex >= 0 && this.filteredChats.length > 0) {
      const currentChat = this.allChats[this.activeIndex];
      const newIndex = this.filteredChats.findIndex(chat => chat.name === currentChat.name);
      this.activeIndex = newIndex !== -1 ? newIndex : -1;
    } else if (this.filteredChats.length === 0) {
      this.activeIndex = -1;
    }
  }
  toggleAdminMenu(): void {
    console.log('Admin menu toggled');
  }
}