export class SignalingService {
    constructor(io) {
        this.io = io;
        this.connectedUsers = new Map(); // Store { socketId: userData }
        this.setupListeners();
    }

    setupListeners() {
        this.io.on("connection", (socket) => {
            // Robust IP detection for Production (behind proxy/LB)
            const forwarded = socket.handshake.headers['x-forwarded-for'];
            const clientIp = forwarded ? forwarded.split(',')[0].trim() : socket.handshake.address;
            let room = `network:${clientIp}`; // Default to IP-based room
            socket.join(room);

            console.log(`[Signaling] User connected: ${socket.id} | IP: ${clientIp} | Room: ${room}`);

            // --- Room Management ---
            socket.on('join-room', ({ roomName }) => {
                const oldRoom = room;
                const newRoom = roomName ? `room:${roomName}` : `network:${clientIp}`; // If empty, back to local

                if (oldRoom === newRoom) return;

                console.log(`[Rooms] ${socket.id} switching from ${oldRoom} to ${newRoom}`);

                // 1. Leave old room
                socket.leave(oldRoom);
                socket.to(oldRoom).emit("peer-left", { id: socket.id });

                // 2. Join new room
                socket.join(newRoom);
                room = newRoom; // Update tracking variable

                // 3. Update User Data Registry with new room
                const currentUser = this.connectedUsers.get(socket.id);
                if (currentUser) {
                    this.connectedUsers.set(socket.id, { ...currentUser, room: newRoom });

                    // 4. Announce to NEW room
                    socket.to(newRoom).emit("peer-presence", currentUser);

                    // 5. Get peers from NEW room
                    const peersInRoom = Array.from(this.connectedUsers.values()).filter(
                        (peer) => peer.room === newRoom && peer.id !== socket.id
                    );
                    socket.emit("active-peers", peersInRoom);
                }
            });

            socket.on('broadcast-room-text', (data) => {
                // Relay string/json to everyone else in current room
                // data = { text, sender }
                socket.to(room).emit('room-text-received', data);
            });


            // Handle device discovery (presence)
            socket.on("announce-presence", (userData) => {
                // Deduplicate: Remove any existing user with same name in ANY room (global unique session per socket)
                this.connectedUsers.set(socket.id, { id: socket.id, ...userData, room, ip: clientIp });

                // 1. Broadcast presence ONLY to same network
                socket.to(room).emit("peer-presence", {
                    id: socket.id,
                    ...userData,
                });

                // 2. Send EXISTING peers ONLY from same network
                const peersInRoom = Array.from(this.connectedUsers.values()).filter(
                    (peer) => peer.room === room && peer.id !== socket.id
                );
                socket.emit("active-peers", peersInRoom);
            });

            // --- Room Management (Advanced) ---
            socket.on('create-room', ({ roomName }, callback) => {
                // Generate simple 6-char passcode
                const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                let passcode = "";
                for (let i = 0; i < 6; i++) {
                    passcode += chars.charAt(Math.floor(Math.random() * chars.length));
                }

                // Store room metadata
                this.activeRooms = this.activeRooms || new Map();
                this.activeRooms.set(passcode, {
                    passcode,
                    name: roomName,
                    owner: socket.id,
                    created: Date.now()
                });

                console.log(`[Rooms] Created room '${roomName}' with passcode ${passcode}`);

                // Switch to new room (inline to update closure)
                const newRoom = `room:${roomName}`;
                socket.leave(room);
                socket.to(room).emit("peer-left", { id: socket.id });
                socket.join(newRoom);
                room = newRoom; // Update closure!

                const currentUser = this.connectedUsers.get(socket.id);
                if (currentUser) {
                    this.connectedUsers.set(socket.id, { ...currentUser, room: newRoom });
                }

                if (callback) callback({ success: true, roomName, passcode });
            });

            socket.on('join-room-by-code', ({ passcode }, callback) => {
                this.activeRooms = this.activeRooms || new Map();

                console.log(`[Rooms] Join attempt with passcode: "${passcode}"`);
                console.log(`[Rooms] Available rooms:`, Array.from(this.activeRooms.keys()));

                const roomData = this.activeRooms.get(passcode);

                if (!roomData) {
                    console.log(`[Rooms] Room not found for passcode: "${passcode}"`);
                    if (callback) callback({ success: false, error: "Invalid Room Code" });
                    return;
                }

                console.log(`[Rooms] Found room: ${roomData.name}`);

                // Switch to room (inline to update closure)
                const newRoom = `room:${roomData.name}`;
                socket.leave(room);
                socket.to(room).emit("peer-left", { id: socket.id });
                socket.join(newRoom);
                room = newRoom; // Update closure!

                const currentUser = this.connectedUsers.get(socket.id);
                if (currentUser) {
                    this.connectedUsers.set(socket.id, { ...currentUser, room: newRoom });
                    socket.to(newRoom).emit("peer-presence", { ...currentUser, room: newRoom });

                    const peersInRoom = Array.from(this.connectedUsers.values()).filter(
                        (peer) => peer.room === newRoom && peer.id !== socket.id
                    );
                    socket.emit("active-peers", peersInRoom);
                }

                if (callback) callback({ success: true, roomName: roomData.name });
            });

            socket.on('leave-room', () => {
                const defaultRoom = `network:${clientIp}`;
                if (room === defaultRoom) return;

                socket.leave(room);
                socket.to(room).emit("peer-left", { id: socket.id });
                socket.join(defaultRoom);
                room = defaultRoom; // Update closure!

                const currentUser = this.connectedUsers.get(socket.id);
                if (currentUser) {
                    this.connectedUsers.set(socket.id, { ...currentUser, room: defaultRoom });
                    socket.to(defaultRoom).emit("peer-presence", { ...currentUser, room: defaultRoom });

                    const peersInRoom = Array.from(this.connectedUsers.values()).filter(
                        (peer) => peer.room === defaultRoom && peer.id !== socket.id
                    );
                    socket.emit("active-peers", peersInRoom);
                }
            });

            // --- Pairing Logic ---
            socket.on('create-pair-code', () => {
                console.log(`[Pairing] Received create-pair-code request from ${socket.id}`);
                // Generate 6-digit code
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                // Store code mapping (In-memory for MVP)
                this.pairingCodes = this.pairingCodes || new Map();
                this.pairingCodes.set(code, socket.id);

                console.log(`[Pairing] Generated code ${code} for ${socket.id}`);
                socket.emit('pair-code-created', code);

                // Auto-expire code after 5 mins
                setTimeout(() => this.pairingCodes.delete(code), 5 * 60 * 1000);
            });

            socket.on('join-with-code', (code) => {
                if (!this.pairingCodes || !this.pairingCodes.has(code)) {
                    socket.emit('pair-error', 'Invalid or expired code');
                    return;
                }

                const targetSocketId = this.pairingCodes.get(code);
                const targetUser = this.connectedUsers.get(targetSocketId);
                const currentUser = this.connectedUsers.get(socket.id);

                if (targetSocketId === socket.id) {
                    socket.emit('pair-error', 'Cannot pair with yourself');
                    return;
                }

                if (targetUser && currentUser) {
                    // Success! Exchange details explicitly (ignoring rooms)

                    // 1. Tell Target about Current
                    this.io.to(targetSocketId).emit('peer-presence', currentUser);
                    this.io.to(targetSocketId).emit('pair-success', { peer: currentUser });

                    // 2. Tell Current about Target
                    socket.emit('peer-presence', targetUser);
                    socket.emit('pair-success', { peer: targetUser });

                    console.log(`[Pairing] Linked ${currentUser.name} and ${targetUser.name}`);
                } else {
                    socket.emit('pair-error', 'Peer not found');
                }
            });


            // WebRTC Signaling (Direct ID addressing, so unaffected by rooms)
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
                const user = this.connectedUsers.get(socket.id);
                this.connectedUsers.delete(socket.id);

                if (user) {
                    // Notify room (User data has current room)
                    this.io.to(user.room).emit("peer-left", { id: socket.id });
                }
            });
        });
    }
}
