import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5004";

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (this.socket) return this.socket;

        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ["websocket"],
        });

        this.socket.on("connect", () => {
            console.log("✅ Connected to signaling server:", this.socket.id);
        });

        this.socket.on("connect_error", (err) => {
            console.error("❌ Socket connection error:", err);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        if (!this.socket) {
            return this.connect();
        }
        return this.socket;
    }
}

export const socketService = new SocketService();
