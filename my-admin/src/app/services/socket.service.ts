import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private socket: Socket;
  private apiUrl = "http://localhost:4000/messages"; // API MongoDB
  private messageListenerRegistered = false; // Biến kiểm tra listener đã đăng ký chưa

  constructor(private http: HttpClient) {
    this.socket = io("http://localhost:4000");
  }

  // 🔥 Đăng ký tên người dùng khi kết nối
  registerUser(userName: string) {
    this.socket.emit("register", userName);
  }

  // 🔥 Lấy tin nhắn từ MongoDB
  getMessages(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // ✅ Gửi tin nhắn (Customer hoặc Admin)
  sendMessage(data: { user: string; message: string; targetUser?: string }) {
    this.socket.emit("sendMessage", data);
  }

  // ✅ Nhận tin nhắn từ Server (Customer hoặc Admin)
  onReceiveMessage(): Observable<{ user: string; message: string; targetUser?: string }> {
    return new Observable((observer) => {
      if (!this.messageListenerRegistered) {
        this.socket.on("receiveMessage", (data) => {
          observer.next(data);
        });
        this.messageListenerRegistered = true;
      }
    });
  }

  // Ngắt kết nối socket khi service bị hủy
  disconnect() {
    this.socket.disconnect();
  }
}