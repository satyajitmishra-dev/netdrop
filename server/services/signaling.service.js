export class SignalingService {
    constructor(io) {
        this.io = io;
        this.connectedUsers = new Map(); // Store { socketId: userData }
        this.setupListeners();
    }

    setupListeners() {
        this.io.on("connection", (socket) => {
            console.log(`[Signaling] User connected: ${socket.id}`);

            // Handle device discovery (presence)
            socket.on("announce-presence", (userData) => {
                // Deduplicate: Remove any existing user with same name
                for (const [id, user] of this.connectedUsers.entries()) {
                    if (user.name === userData.name && id !== socket.id) {
                        this.connectedUsers.delete(id);
                        socket.broadcast.emit('peer-left', { id });
                    }
                }

                // Store user data
                this.connectedUsers.set(socket.id, { id: socket.id, ...userData });

                // 1. Broadcast this new user to everyone else
                socket.broadcast.emit("peer-presence", {
                    id: socket.id,
                    ...userData,
                });

                // 2. Send ALL existing users to this new user (so they see who is already here)
                const existingPeers = Array.from(this.connectedUsers.values()).filter(
                    (peer) => peer.id !== socket.id
                );
                socket.emit("active-peers", existingPeers);
            });

            // WebRTC Signaling
            socket.on("signal-offer", ({ targetId, offer }) => {
                this.io.to(targetId).emit("signal-offer", {
                    senderId: socket.id,
                    offer,
                });
            });

            socket.on("signal-answer", ({ targetId, answer }) => {
                this.io.to(targetId).emit("signal-answer", {
                    senderId: socket.id,
                    answer,
                });
            });

            socket.on("signal-ice-candidate", ({ targetId, candidate }) => {
                this.io.to(targetId).emit("signal-ice-candidate", {
                    senderId: socket.id,
                    candidate,
                });
            });

            socket.on("disconnect", () => {
                console.log(`[Signaling] User disconnected: ${socket.id}`);
                this.connectedUsers.delete(socket.id);
                this.io.emit("peer-left", { id: socket.id });
            });
        });
    }
}
