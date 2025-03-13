import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private apiUrl = "http://localhost:3000/messages"; // API lấy tin nhắn từ MongoDB
  private messageListenerRegistered = false;

  constructor(private http: HttpClient) {
    this.socket = io("http://localhost:3000");
  }

  // 🔥 Đăng ký tên người dùng khi kết nối
  registerUser(userName: string): void {
    this.socket.emit("register", userName);
  }

  // 🔥 Lấy toàn bộ tin nhắn từ database
  getMessages(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // ✅ Gửi tin nhắn từ Customer hoặc Admin
  sendMessage(data: { user: string; message: string; targetUser?: string }): void {
    this.socket.emit("sendMessage", data);
  }

  // ✅ Nhận tin nhắn từ Server (Customer hoặc Admin)
  onReceiveMessage(): Observable<{ user: string; message: string; targetUser?: string }> {
    return new Observable((observer) => {
      if (!this.messageListenerRegistered) {
        this.socket.on("receiveMessage", (data: { user: string; message: string; targetUser?: string }) => {
          observer.next(data);
        });
        this.messageListenerRegistered = true;
      }
    });
  }

  // 🔥 Ngắt kết nối socket
  disconnect(): void {
    this.socket.disconnect();
  }
}