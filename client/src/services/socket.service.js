import { io } from "socket.io-client";

// Production: Use Render backend. Development: Use localhost.
const PRODUCTION_SERVER = "https://netdrop-server.onrender.com";
const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

// Dynamic Socket URL:
// 1. Production: use VITE_SOCKET_URL (if set) OR Render backend directly.
//    - We need direct connection because Vercel (static) cannot proxy WebSockets to Render.
// 2. Development: Use relative path "/" to leverage Vite Proxy (avoids Mixed Content on local HTTPS)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD
    ? "https://netdrop-server.onrender.com"
    : "/");

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (this.socket) return this.socket;

        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        this.socket.on("connect", () => {
            // Connection established
        });

        this.socket.on("connect_error", () => {
            // Connection error handled silently
        });

        this.socket.on("disconnect", (reason) => {
            // Disconnected
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
