import { useEffect, useRef } from 'react';

export const useWebRTC = () => {
    const webRTCRef = useRef(null);
    const isLoaded = useRef(false);

    useEffect(() => {
        let mounted = true;

        import('../services/webrtc.service').then(({ webRTCService }) => {
            if (mounted) {
                webRTCRef.current = webRTCService;
                isLoaded.current = true;
            }
        });

        // Cleanup? WebRTC service is singleton, so maybe not strictly needed to nullify
        return () => { mounted = false; };
    }, []);

    const getService = () => {
        if (!isLoaded.current) {
            console.warn("WebRTC service not yet fully loaded");
        }
        return webRTCRef.current;
    };

    return { webRTCRef, getService };
};
