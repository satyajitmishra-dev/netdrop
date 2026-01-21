export class SignalingService {
    constructor(io) {
        this.io = io;
        this.connectedUsers = new Map(); // Store { socketId: userData }
        this.activeRooms = new Map();
        this.pairingCodes = new Map(); // Initialize here
        this.setupListeners();
    }

    setupListeners() {
        this.io.on("connection", (socket) => {
            // ... (rest of code) ...

            // Robust IP detection for Production (behind proxy/LB)

            const forwarded = socket.handshake.headers['x-forwarded-for'];
            let clientIp = forwarded ? forwarded.split(',')[0].trim() : socket.handshake.address;

            // Normalize IPv6 mapped IPv4
            if (clientIp && clientIp.startsWith('::ffff:')) {
                clientIp = clientIp.substring(7);
            }

            let room = `network:${clientIp}`; // Default to IP-based room
            socket.join(room);

            // --- Room Management ---
            socket.on('join-room', ({ roomName }) => {
                const oldRoom = room;
                const newRoom = roomName ? `room:${roomName}` : `network:${clientIp}`; // If empty, back to local

                if (oldRoom === newRoom) return;

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

                const roomData = this.activeRooms.get(passcode);

                if (!roomData) {
                    if (callback) callback({ success: false, error: "Invalid Room Code" });
                    return;
                }

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

            // --- Pairing Logic (Unified with Rooms) ---
            socket.on('create-pair-code', () => {
                // Generate 6-digit code
                const code = Math.floor(100000 + Math.random() * 900000).toString();

                // Store as a Room
                this.activeRooms = this.activeRooms || new Map();
                this.activeRooms.set(code, {
                    passcode: code,
                    name: `Pairing-${code}`,
                    owner: socket.id,
                    created: Date.now(),
                    isPairing: true // Flag to distinguish if needed
                });

                // Join the room immediately
                const newRoom = `room:${code}`;
                const oldRoom = room;

                if (oldRoom !== newRoom) {
                    socket.leave(oldRoom);
                    socket.to(oldRoom).emit("peer-left", { id: socket.id });
                    socket.join(newRoom);
                    room = newRoom; // Update closure

                    const currentUser = this.connectedUsers.get(socket.id);
                    if (currentUser) {
                        this.connectedUsers.set(socket.id, { ...currentUser, room: newRoom });
                    }
                }

                socket.emit('pair-code-created', code);

                // Auto-expire room after 30 mins (increased for persistence)
                setTimeout(() => {
                    if (this.activeRooms.has(code)) {
                        this.activeRooms.delete(code);
                    }
                }, 30 * 60 * 1000);
            });

            socket.on('join-with-code', (rawCode) => {
                const code = String(rawCode).trim();

                // Check active rooms first (Unified Logic)
                const roomData = this.activeRooms?.get(code);

                if (!roomData) {
                    socket.emit('pair-error', 'Invalid or expired code');
                    return;
                }

                // specific check to prevent self-pairing loop if already in room?
                // Actually, re-joining is fine, it just refreshes.

                const newRoom = `room:${code}`;
                const oldRoom = room;

                socket.leave(oldRoom);
                socket.to(oldRoom).emit("peer-left", { id: socket.id });
                socket.join(newRoom);
                room = newRoom; // Update closure

                const currentUser = this.connectedUsers.get(socket.id);
                if (currentUser) {
                    this.connectedUsers.set(socket.id, { ...currentUser, room: newRoom });

                    // Announce presence to the room
                    socket.to(newRoom).emit("peer-presence", { ...currentUser, room: newRoom });

                    // Get peers currently in the room
                    const peersInRoom = Array.from(this.connectedUsers.values()).filter(
                        (peer) => peer.room === newRoom && peer.id !== socket.id
                    );

                    // Send success to self with peers
                    socket.emit("active-peers", peersInRoom);

                    // For UI compatibility: Send 'pair-success' to self
                    // If peers exist, take the first one as "the peer" for the toast
                    if (peersInRoom.length > 0) {
                        socket.emit('pair-success', { peer: peersInRoom[0] });
                        // Also notify the existing peers that pairing succeeded (optional, but good for UX)
                        socket.to(newRoom).emit('pair-success', { peer: currentUser });
                    } else {
                        // Just joined, waiting for others
                        socket.emit('pair-success', { peer: { name: 'Waiting for peer...' } });
                    }
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
