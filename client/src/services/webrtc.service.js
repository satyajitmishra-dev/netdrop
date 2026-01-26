import { socketService } from "./socket.service";
// WebRTC Service - Handles P2P Data & Signaling

const RTC_CONFIG = {
    iceServers: [
        // STUN servers (Google - Robust & Reliable)
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },

        // Metered.ca TURN servers
        // Note: Free tier credentials may expire or hit limits.
        // If connection fails, consider hosting a dedicated TURN server (e.g. Coturn).
        {
            urls: "turn:a.relay.metered.ca:80",
            username: "e8dd65c92f6d2067c9a89e4c",
            credential: "uWdWNmkhvyqVmUFO"
        },
        {
            urls: "turn:a.relay.metered.ca:443",
            username: "e8dd65c92f6d2067c9a89e4c",
            credential: "uWdWNmkhvyqVmUFO"
        },
        {
            urls: "turn:a.relay.metered.ca:443?transport=tcp",
            username: "e8dd65c92f6d2067c9a89e4c",
            credential: "uWdWNmkhvyqVmUFO"
        }
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle', // Optimizes connection usage
    iceTransportPolicy: 'all',  // Ensure we don't force relay
};

class WebRTCService {
    constructor() {
        this.peerConnection = null;
        this.dataChannel = null;
        this.onDataReceived = null;
        this.onSendProgress = null;
        this.targetPeerId = null;

        // File Transfer State
        this.incomingFile = {
            buffer: [],
            meta: null,
            receivedSize: 0,
            startTime: 0
        };

        // Pending Outgoing Transfer
        this.pendingTransfer = {
            file: null,
            peerId: null
        };

        this.pendingMeta = null;

        this.init();
    }

    init() {
        const socket = socketService.getSocket();

        socket.on("signal-offer", async ({ senderId, offer }) => {
            await this.handleOffer(senderId, offer);
        });

        socket.on("signal-answer", async ({ senderId, answer }) => {
            await this.handleAnswer(answer);
        });

        socket.on("signal-ice-candidate", async ({ senderId, candidate }) => {
            await this.handleIceCandidate(candidate);
        });
    }

    // Initiator: Start connection
    connectToPeer(targetPeerId, payload = null, extraMeta = {}) {
        return new Promise((resolve, reject) => {
            // 1. Reuse existing connection if valid
            if (this.peerConnection &&
                this.targetPeerId === targetPeerId &&
                this.peerConnection.connectionState === 'connected' &&
                this.dataChannel &&
                this.dataChannel.readyState === 'open') {

                // Reusing existing WebRTC connection
                try {
                    if (payload) {
                        if (payload instanceof File) {
                            this.sendFile(payload, extraMeta);
                        } else {
                            this.sendData(JSON.stringify(payload));
                        }
                    }
                    resolve();
                } catch (e) {
                    reject(e);
                }
                return;
            }

            // 2. Clean up old connection
            if (this.peerConnection) {
                this.peerConnection.close();
                this.peerConnection = null;
            }

            this.targetPeerId = targetPeerId;
            this.pendingPayload = payload;
            this.pendingMeta = extraMeta;

            // Store promise functions to resolve later
            this.connectResolve = resolve;
            this.connectReject = reject;

            this.createPeerConnection();

            // Create Data Channel
            this.dataChannel = this.peerConnection.createDataChannel("file-transfer");
            this.setupDataChannel(this.dataChannel);

            // Create Offer
            this.peerConnection.createOffer()
                .then(offer => this.peerConnection.setLocalDescription(offer))
                .then(() => {
                    socketService.getSocket().emit("signal-offer", {
                        targetId: targetPeerId,
                        offer: this.peerConnection.localDescription,
                    });
                })
                .catch(err => {
                    console.error("Error creating offer:", err);
                    if (this.connectReject) {
                        this.connectReject(err);
                        this.connectReject = null;
                    }
                });

            // Set a Safety Timeout (30s) - Increased for mobile/cross-network
            setTimeout(() => {
                if (this.connectReject && this.peerConnection?.connectionState !== 'connected') {
                    this.connectReject(new Error("Device unreachable. Timeout (30s). Check network/firewall."));
                    this.connectReject = null;
                    this.connectResolve = null;

                    // Clean up if failed
                    if (this.peerConnection) {
                        this.peerConnection.close();
                        this.peerConnection = null;
                    }
                }
            }, 30000);
        });
    }

    // Receiver: Handle incoming offer
    async handleOffer(senderId, offer) {
        // If we have an existing connection, close it to accept new one
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.targetPeerId = senderId;
        this.createPeerConnection();
        // Initialize candidate queue
        this.candidateQueue = [];

        // Receiver waits for data channel event
        this.peerConnection.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.setupDataChannel(this.dataChannel);
        };

        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            // Process queued candidates
            this.processCandidateQueue();

            // Create Answer
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            // Send Answer
            socketService.getSocket().emit("signal-answer", {
                targetId: senderId,
                answer,
            });
        } catch (err) {
            console.error("Error handling offer:", err);
            if (this.onSendProgress) this.onSendProgress({ type: 'rejected', error: 'Connection Failed (Offer)' });
        }
    }

    async handleAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            // Process queued candidates
            this.processCandidateQueue();
        } catch (err) {
            console.error("Error handling answer:", err);
        }
    }

    async handleIceCandidate(candidate) {
        if (!this.peerConnection) return;

        // If remote description is set, add immediately
        // Otherwise queue it
        if (this.peerConnection.remoteDescription && this.peerConnection.remoteDescription.type) {
            try {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error("Error adding received ice candidate", err);
            }
        } else {
            // Queue it
            if (!this.candidateQueue) this.candidateQueue = [];
            this.candidateQueue.push(candidate);
        }
    }

    async processCandidateQueue() {
        if (!this.peerConnection || !this.candidateQueue) return;

        while (this.candidateQueue.length > 0) {
            const candidate = this.candidateQueue.shift();
            try {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error("Error flushing candidate queue", err);
            }
        }
    }

    createPeerConnection() {
        try {
            this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

            this.peerConnection.oniceconnectionstatechange = () => {
                const state = this.peerConnection.iceConnectionState;
                /* console.log(`ICE State: ${state}`); */

                if (state === 'failed' || state === 'disconnected') {
                    // Fail fast
                    if (this.connectReject) {
                        this.connectReject(new Error("Connection Failed (ICE " + state + ")"));
                        this.connectReject = null;
                        this.connectResolve = null;
                    }
                    // Notify App.jsx to stop spinner
                    if (this.onSendProgress) {
                        this.onSendProgress({ type: 'rejected', error: 'Connection lost (Check Firewall/NAT)' });
                    }
                }
            };
        } catch (err) {
            console.error("RTCPeerConnection failed:", err);
            if (this.onSendProgress) this.onSendProgress({ type: 'rejected', error: 'WebRTC Init Failed' });
            return;
        }

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socketService.getSocket().emit("signal-ice-candidate", {
                    targetId: this.targetPeerId,
                    candidate: event.candidate,
                });
            }
        };

        this.peerConnection.onconnectionstatechange = () => {
            // Connection state changed
        };
    }

    setupDataChannel(channel) {
        channel.binaryType = 'arraybuffer'; // Crucial for file transfer

        channel.onopen = () => {
            console.log("Data Channel Opened");
            if (this.pendingPayload) {
                try {
                    if (this.pendingPayload instanceof File) {
                        this.sendFile(this.pendingPayload, this.pendingMeta || {});
                    } else {
                        this.sendData(JSON.stringify(this.pendingPayload));
                    }
                    if (this.connectResolve) {
                        this.connectResolve(); // Success!
                        this.connectResolve = null;
                        this.connectReject = null;
                    }
                } catch (err) {
                    if (this.connectReject) {
                        this.connectReject(err);
                        this.connectResolve = null;
                        this.connectReject = null;
                    }
                }
                this.pendingPayload = null;
                this.pendingMeta = null;
            } else {
                // Just connected without payload
                if (this.connectResolve) {
                    this.connectResolve();
                    this.connectResolve = null;
                    this.connectReject = null;
                }
            }
        };

        channel.onclose = () => {
            console.log("Data Channel Closed");
            this.incomingFile = { buffer: [], meta: null, receivedSize: 0, startTime: 0 };
        };

        channel.onerror = (error) => {
            console.error("Data Channel Error:", error);
            if (this.connectReject) {
                this.connectReject(error);
                this.connectResolve = null;
                this.connectReject = null;
            }
        };

        channel.onmessage = (event) => {
            const { data } = event;

            // Handle Binary Chunk (File)
            if (data instanceof ArrayBuffer) {
                this.handleFileChunk(data);
                return;
            }

            // Handle JSON (Signaling/Text)
            try {
                const parsed = JSON.parse(data);

                if (parsed.type === 'file-request') {
                    // Notify UI about incoming file request
                    if (this.onDataReceived) {
                        this.onDataReceived(parsed, this.targetPeerId);
                    }
                }
                else if (parsed.type === 'file-accept') {
                    // Receiver accepted the file, start sending
                    if (this.pendingTransfer.file) {
                        this.startChunkedTransfer(this.pendingTransfer.file);
                        this.pendingTransfer = { file: null, peerId: null };
                    }
                }
                else if (parsed.type === 'file-reject') {
                    // Receiver rejected
                    this.pendingTransfer = { file: null, peerId: null };
                    if (this.onSendProgress) {
                        this.onSendProgress({ type: 'rejected' });
                    }
                }
                else if (parsed.type === 'file-start') {
                    // Legacy or direct start (if we keep it) - Initialize reception
                    this.incomingFile.meta = parsed.meta;
                    this.incomingFile.buffer = [];
                    this.incomingFile.receivedSize = 0;
                    this.incomingFile.startTime = Date.now();
                }
                else {
                    if (this.onDataReceived) {
                        this.onDataReceived(parsed, this.targetPeerId);
                    }
                }
            } catch (e) {
                if (this.onDataReceived) {
                    this.onDataReceived(data, this.targetPeerId);
                }
            }
        };
    }

    sendData(data) {
        if (this.dataChannel && this.dataChannel.readyState === "open") {
            this.dataChannel.send(data);
        } else {
            // Data Channel not open
        }
    }

    async sendFile(file, extraMeta = {}) {
        // Store file and wait for acceptance
        this.pendingTransfer.file = file;
        this.pendingTransfer.peerId = this.targetPeerId;

        // Extract sender info from extraMeta if present
        const { sender, ...otherMeta } = extraMeta;

        // Send Request
        this.sendData(JSON.stringify({
            type: 'file-request',
            sender: sender, // Pass sender info at root level
            meta: {
                name: file.name,
                size: file.size,
                type: file.type,
                ...otherMeta // Pass remaining meta (e.g. senderEmail)
            }
        }));
    }

    async startChunkedTransfer(file) {
        const CHUNK_SIZE = 16 * 1024; // 16KB
        const MAX_BUFFER_THRESHOLD = 64 * 1024; // 64KB

        // 1. Send Metadata (Start Signal) - Still needed for receiver to init buffer
        this.sendData(JSON.stringify({
            type: 'file-start',
            meta: {
                name: file.name,
                size: file.size,
                type: file.type
            }
        }));

        // 2. Read and Send Chunks
        let offset = 0;

        while (offset < file.size) {
            const chunkBlob = file.slice(offset, offset + CHUNK_SIZE);
            const chunk = await chunkBlob.arrayBuffer();

            while (this.dataChannel.bufferedAmount > MAX_BUFFER_THRESHOLD) {
                await new Promise(r => setTimeout(r, 5));
            }

            try {
                this.sendData(chunk);
                offset += CHUNK_SIZE;

                if (this.onSendProgress) {
                    // Optional progress
                }

            } catch (error) {
                console.warn("Send failed, retrying chunk...", error);
                await new Promise(r => setTimeout(r, 50));
            }
        }

        if (this.onSendProgress) {
            this.onSendProgress({ type: 'complete', file: file });
        }
    }

    acceptFileTransfer() {
        this.sendData(JSON.stringify({ type: 'file-accept' }));
    }

    rejectFileTransfer() {
        this.sendData(JSON.stringify({ type: 'file-reject' }));
    }

    handleFileChunk(buffer) {
        if (!this.incomingFile.meta) return;

        this.incomingFile.buffer.push(buffer);
        this.incomingFile.receivedSize += buffer.byteLength;

        // Progress Calculation (Optional: emit progress event)
        // const progress = this.incomingFile.receivedSize / this.incomingFile.meta.size;

        if (this.incomingFile.receivedSize >= this.incomingFile.meta.size) {
            const blob = new Blob(this.incomingFile.buffer, { type: this.incomingFile.meta.type });

            // Emit Complete
            if (this.onDataReceived) {
                this.onDataReceived({
                    type: 'file-complete',
                    file: blob,
                    meta: this.incomingFile.meta
                }, this.targetPeerId);
            }

            // Reset
            this.incomingFile = { buffer: [], meta: null, receivedSize: 0, startTime: 0 };
        }
    }
}

export const webRTCService = new WebRTCService();
