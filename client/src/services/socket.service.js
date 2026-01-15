import { io } from "socket.io-client";

// Production: Use Render backend. Development: Use localhost.
const PRODUCTION_SERVER = "https://netdrop-server.onrender.com";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? PRODUCTION_SERVER : "http://localhost:5004");

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (this.socket) return this.socket;

        console.log(`[SocketService] Connecting to: ${SOCKET_URL}`);

        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        this.socket.on("connect", () => {
            console.log(`[SocketService] ✅ Connected! Socket ID: ${this.socket.id}`);
        });

        this.socket.on("connect_error", (err) => {
            console.error(`[SocketService] ❌ Connection Error:`, err.message);
        });

        this.socket.on("disconnect", (reason) => {
            console.warn(`[SocketService] Disconnected: ${reason}`);
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
        const socket = this.getSocket();

        if (!socket || !socket.connected) {
            if (socket) socket.connect();
            return;
        }



        // Remove any existing listeners to prevent duplicates
        socket.off('pair-code-created');

        socket.once('pair-code-created', (code) => {
            callback(code);
        });

        socket.emit('create-pair-code');
    }

    joinWithCode(code) {
        const socket = this.getSocket();
        if (!socket) return;
        socket.emit('join-with-code', code);
    }

    createRoom(roomName, callback) {
        const socket = this.getSocket();
        if (!socket) return;
        socket.emit('create-room', { roomName }, callback);
    }

    joinRoomByCode(passcode, callback) {
        const socket = this.getSocket();
        if (!socket) return;
        socket.emit('join-room-by-code', { passcode }, callback);
    }

    leaveRoom() {
        if (!this.socket) return; // Leaving doesn't need to create new connection if none exists
        this.socket.emit('leave-room');
    }

    broadcastText(text, sender) {
        if (!this.socket) return;
        this.socket.emit('broadcast-room-text', { text, sender });
    }
}

export const socketService = new SocketService();
