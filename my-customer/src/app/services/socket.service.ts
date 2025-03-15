import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

// Interface cho tin nhắn đầy đủ (từ API hoặc nhận từ socket)
export interface Message {
  _id?: string; // Từ API GET /messages
  user: string;
  message: string;
  targetUser: string; // Bắt buộc theo backend
  timestamp?: string; // Từ API GET /messages
}

// Interface cho dữ liệu gửi tin nhắn (chỉ các trường bắt buộc)
export interface SendMessageData {
  user: string;
  message: string;
  targetUser: string; // Bắt buộc
}

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private socket: Socket;
  private apiUrl = "http://localhost:4000/messages";
  private messageListenerRegistered = false;
  private socketUrl = "http://localhost:4000";

  constructor(private http: HttpClient) {
    this.socket = io(this.socketUrl, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
    });
  }

  registerUser(userName: string): void {
    if (!userName) {
      console.error("User name is required for registration");
      return;
    }
    this.socket.emit("register", userName);
  }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl);
  }

  sendMessage(data: SendMessageData): void {
    if (!data.targetUser) {
      console.error("Target user is required to send a message");
      return;
    }
    this.socket.emit("sendMessage", data);
  }

  onReceiveMessage(): Observable<Message> {
    return new Observable((observer) => {
      if (!this.messageListenerRegistered) {
        this.socket.on("receiveMessage", (data: Message) => {
          observer.next(data);
        });
        this.messageListenerRegistered = true;
      }
    });
  }

  disconnect(): void {
    this.socket.disconnect();
    this.messageListenerRegistered = false;
  }

  isConnected(): boolean {
    return this.socket.connected;
  }
}