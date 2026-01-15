import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { webRTCService } from '../services/webrtc.service';

const WebRTCContext = createContext(null);

export const WebRTCProvider = ({ children }) => {
    // We can use state if we need to trigger re-renders on connection status changes,
    // but for now, we just want to expose the singleton consistently.
    const serviceRef = useRef(webRTCService);

    return (
        <WebRTCContext.Provider value={serviceRef.current}>
            {children}
        </WebRTCContext.Provider>
    );
};

export const useWebRTCContext = () => {
    const context = useContext(WebRTCContext);
    if (!context) {
        throw new Error('useWebRTCContext must be used within a WebRTCProvider');
    }
    return context;
};
