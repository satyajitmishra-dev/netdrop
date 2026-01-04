import { socketService } from "./socket.service";

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
    async connectToPeer(targetPeerId) {
        this.targetPeerId = targetPeerId;
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
        channel.onopen = () => {
            console.log("Data Channel OPEN");
        };
        channel.onmessage = (event) => {
            console.log("Received data:", event.data);
            if (this.onDataReceived) {
                this.onDataReceived(event.data);
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
}

export const webRTCService = new WebRTCService();
