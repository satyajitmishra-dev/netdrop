import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5004";

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
    createPairCode(callback) {
        if (!this.socket) {
            console.error('Socket not initialized in createPairCode');
            return;
        }
        console.log('Emitting create-pair-code');
        this.socket.emit('create-pair-code');
        this.socket.once('pair-code-created', (code) => {
            console.log('Received pair-code-created:', code);
            callback(code);
        });
    }

    joinWithCode(code) {
        if (!this.socket) return;
        this.socket.emit('join-with-code', code);
    }

    createRoom(roomName, callback) {
        if (!this.socket) return;
        this.socket.emit('create-room', { roomName }, callback);
    }

    joinRoomByCode(passcode, callback) {
        if (!this.socket) return;
        this.socket.emit('join-room-by-code', { passcode }, callback);
    }

    leaveRoom() {
        if (!this.socket) return;
        this.socket.emit('leave-room');
    }

    broadcastText(text, sender) {
        if (!this.socket) return;
        this.socket.emit('broadcast-room-text', { text, sender });
    }
}

export const socketService = new SocketService();
