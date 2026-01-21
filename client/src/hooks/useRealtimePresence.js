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

                // Auto-rejoin persistent room if exists
                const savedRoom = localStorage.getItem('netdrop_room_code');
                if (savedRoom) {
                    socket.emit('join-with-code', savedRoom);
                    // We don't need to show a toast here, the server will send 'active-peers'
                    // and 'pair-success' which will trigger UI updates if needed.
                    // Or we could toast "Restored connection"
                    toast("Restoring connection...", { icon: '🔄', duration: 2000 });
                }

                toast.success("Connected to NetDrop Network", {
                    id: 'netdrop-connect',
                    style: { background: '#0f172a', color: '#fff', border: '1px solid #2563EB' }
                });
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                discoveryService.leave();
            } else {
                if (socket.connected) {
                    discoveryService.init(deviceInfo);
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
