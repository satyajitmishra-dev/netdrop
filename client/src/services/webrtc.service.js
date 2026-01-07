import { socketService } from "./socket.service";
// WebRTC Service - Handles P2P Data & Signaling

const RTC_CONFIG = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
    ],
};

class WebRTCService {
    constructor() {
        this.peerConnection = null;
        this.dataChannel = null;
        this.onDataReceived = null;
        this.targetPeerId = null;

        // File Transfer State
        this.incomingFile = {
            buffer: [],
            meta: null,
            receivedSize: 0,
            startTime: 0
        };

        this.init();
    }

    init() {
        const socket = socketService.getSocket();

        socket.on("signal-offer", async ({ senderId, offer }) => {
            console.log("Received Offer from:", senderId);
            await this.handleOffer(senderId, offer);
        });

        socket.on("signal-answer", async ({ senderId, answer }) => {
            console.log("Received Answer from:", senderId);
            await this.handleAnswer(answer);
        });

        socket.on("signal-ice-candidate", async ({ senderId, candidate }) => {
            await this.handleIceCandidate(candidate);
        });
    }

    // Initiator: Start connection
    async connectToPeer(targetPeerId, payload = null) {
        // 1. Reuse existing connection if valid
        if (this.peerConnection &&
            this.targetPeerId === targetPeerId &&
            this.peerConnection.connectionState === 'connected' &&
            this.dataChannel &&
            this.dataChannel.readyState === 'open') {

            console.log("Reusing existing WebRTC connection to", targetPeerId);
            if (payload) {
                if (payload instanceof File) {
                    this.sendFile(payload);
                } else {
                    // Wrap non-file payload in same structure if needed, or just send
                    // logic below assumes pendingPayload sends appropriately.
                    this.sendData(JSON.stringify(payload));
                }
            }
            return;
        }

        // 2. Clean up old connection if switching peers or restarting
        if (this.peerConnection) {
            console.warn("Closing old connection to start new one");
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.targetPeerId = targetPeerId;
        this.pendingPayload = payload;

        this.createPeerConnection();

        // Create Data Channel
        this.dataChannel = this.peerConnection.createDataChannel("file-transfer");
        this.setupDataChannel(this.dataChannel);

        // Create Offer
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        // Send Offer
        socketService.getSocket().emit("signal-offer", {
            targetId: targetPeerId,
            offer,
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

        // Receiver waits for data channel event
        this.peerConnection.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.setupDataChannel(this.dataChannel);
        };

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        // Create Answer
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // Send Answer
        socketService.getSocket().emit("signal-answer", {
            targetId: senderId,
            answer,
        });
    }

    async handleAnswer(answer) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    async handleIceCandidate(candidate) {
        if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    createPeerConnection() {
        this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socketService.getSocket().emit("signal-ice-candidate", {
                    targetId: this.targetPeerId,
                    candidate: event.candidate,
                });
            }
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log("WebRTC State:", this.peerConnection.connectionState);
        };
    }

    setupDataChannel(channel) {
        channel.binaryType = 'arraybuffer'; // Crucial for file transfer

        channel.onopen = () => {
            console.log("Data Channel OPEN");
            if (this.pendingPayload) {
                if (this.pendingPayload instanceof File) {
                    this.sendFile(this.pendingPayload);
                } else {
                    this.sendData(JSON.stringify(this.pendingPayload));
                }
                this.pendingPayload = null;
            }
        };

        channel.onclose = () => {
            console.log("Data Channel CLOSED");
            this.incomingFile = { buffer: [], meta: null, receivedSize: 0, startTime: 0 };
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

                if (parsed.type === 'file-start') {
                    this.incomingFile.meta = parsed.meta;
                    this.incomingFile.buffer = [];
                    this.incomingFile.receivedSize = 0;
                    this.incomingFile.startTime = Date.now();
                    console.log(`Receiving file: ${parsed.meta.name} (${parsed.meta.size} bytes)`);
                }
                else {
                    if (this.onDataReceived) {
                        this.onDataReceived(parsed, this.targetPeerId);
                    }
                }
            } catch (e) {
                console.warn("Received non-JSON text:", data);
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
            console.error("Data Channel not open");
        }
    }

    async sendFile(file) {
        const CHUNK_SIZE = 16 * 1024; // 16KB

        // 1. Send Metadata
        this.sendData(JSON.stringify({
            type: 'file-start',
            meta: {
                name: file.name,
                size: file.size,
                type: file.type
            }
        }));

        // 2. Read and Send Chunks
        const arrayBuffer = await file.arrayBuffer();
        for (let i = 0; i < arrayBuffer.byteLength; i += CHUNK_SIZE) {
            const chunk = arrayBuffer.slice(i, i + CHUNK_SIZE);

            // Wait for buffer to clear if too full
            if (this.dataChannel.bufferedAmount > 16 * 1024 * 1024) { // 16MB buffer limit
                await new Promise(r => setTimeout(r, 100));
            }

            this.sendData(chunk);
        }

        console.log("File sent successfully");
        if (this.onSendProgress) {
            this.onSendProgress({ type: 'complete', file: file });
        }
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
            console.log("File reception complete");
        }
    }
}

export const webRTCService = new WebRTCService();
