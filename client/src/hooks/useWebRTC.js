import { useWebRTCContext } from '../context/WebRTCContext';

export const useWebRTC = () => {
    const webRTCService = useWebRTCContext();

    // Compatibility wrapper to match previous hook signature
    // Previous signature returned { webRTCRef: { current: service } }
    // We'll return the service directly but also maintain the ref structure if strictly needed by App (it was used as webrtcRef.current)
    // However, looking at App.jsx, it accesses webRTCRef.current.
    // So we should return an object that mimics that structure OR refactor App.jsx deeper.
    // Refactoring App.jsx is better. But let's keep this hook simple.

    return {
        webRTCRef: { current: webRTCService }, // Backward compatibility for now
        webRTCService
    };
};

