import { socketService } from "./socket.service";
import { store } from "../store/store";
import { addPeer, removePeer, setPeers } from "../store/slices/transfer.slice";

class DiscoveryService {
    constructor() {
        this.init = this.init.bind(this);
    }

    // Initialize discovery
    init(deviceInfo) {
        this.socket = socketService.getSocket();

        // 1. Announce self
        this.socket.emit("announce-presence", deviceInfo);

        // 2. Listen for existing peers (Bulk load on join)
        this.socket.off("active-peers");
        this.socket.on("active-peers", (peers) => {
            store.dispatch(setPeers(peers));
        });

        // 3. Listen for new peers joining later
        this.socket.off("peer-presence");
        this.socket.on("peer-presence", (peer) => {
            store.dispatch(addPeer(peer));
        });

        this.socket.off("peer-left");
        this.socket.on("peer-left", ({ id }) => {
            store.dispatch(removePeer(id));
        });
    }

    // Notify server we are leaving (e.g. tab close/background)
    leave() {
        if (this.socket) {
            this.socket.emit('peer-left', { id: this.socket.id });
        }
    }
}

export const discoveryService = new DiscoveryService();
