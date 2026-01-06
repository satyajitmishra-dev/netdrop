import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { socketService } from '../services/socket.service';
import { discoveryService } from '../services/discovery.service';

export const useRealtimePresence = (deviceInfo) => {
    // deviceInfo: { name, type }
    const socketRef = useRef(null);

    useEffect(() => {
        if (!deviceInfo.name) return; // Wait for device info

        const socket = socketService.connect();
        socketRef.current = socket;

        const handleConnect = () => {
            if (!document.hidden) {
                discoveryService.init(deviceInfo);
                toast.success("Connected to NetDrop Network", {
                    id: 'netdrop-connect',
                    style: { background: '#0f172a', color: '#fff', border: '1px solid #2563EB' }
                });
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                discoveryService.leave();
                console.log("🙈 App backgrounded - Hidden from discovery");
            } else {
                if (socket.connected) {
                    discoveryService.init(deviceInfo);
                    console.log("👀 App active - Announced presence");
                }
            }
        };

        if (socket.connected) handleConnect();
        else socket.on('connect', handleConnect);

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            socket.off('connect', handleConnect);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            discoveryService.leave();
            socketService.disconnect();
        };
    }, [deviceInfo.name, deviceInfo.type]); // Re-run if identity changes

    return socketRef.current;
};
