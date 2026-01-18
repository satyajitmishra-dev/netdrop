import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setMyDevice } from '../store/slices/transfer.slice';

export const useDeviceIdentity = () => {
    const dispatch = useDispatch();
    const [deviceInfo, setDeviceInfo] = useState({ name: '', type: 'desktop' });

    // Helper: Detect Device Type & Default Name
    const detectDevice = () => {
        const ua = navigator.userAgent;
        let type = 'desktop';
        let defaultName = 'Device';

        if (/ipad|tablet/i.test(ua)) type = 'tablet';
        else if (/mobile/i.test(ua)) type = 'mobile';

        if (/windows/i.test(ua)) defaultName = 'Windows PC';
        else if (/macintosh|mac os x/i.test(ua)) defaultName = 'MacBook';
        else if (/android/i.test(ua)) defaultName = 'Android';
        else if (/iphone/i.test(ua)) defaultName = 'iPhone';
        else if (/linux/i.test(ua)) defaultName = 'Linux PC';

        // Detect Browser
        let browser = 'Web';
        if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
        else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
        else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
        else if (/edg/i.test(ua)) browser = 'Edge';
        else if (/opera|opr/i.test(ua)) browser = 'Opera';

        // Detect Network (Best Effort)
        let network = 'Unknown';
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
            // effectiveType: '4g', '3g', '2g', 'slow-2g'
            // type: 'wifi', 'cellular', etc. (less supported)
            if (conn.type === 'wifi') network = 'WiFi';
            else if (conn.type === 'cellular') network = 'Cellular';
            else if (conn.effectiveType) network = conn.effectiveType.toUpperCase();
        }

        return {
            type,
            defaultName: `${defaultName}-${Math.floor(Math.random() * 1000)}`,
            browser,
            network
        };
    };

    useEffect(() => {
        const { type, defaultName, browser, network } = detectDevice();

        // Load saved name or use default
        let savedName = localStorage.getItem('netdrop_device_name');
        if (!savedName) {
            savedName = defaultName;
            localStorage.setItem('netdrop_device_name', savedName);
        }

        const info = { name: savedName, type, browser, network };
        setDeviceInfo(info);
        dispatch(setMyDevice(info));
    }, [dispatch]);

    // Rename function (No reload needed)
    const renameDevice = useCallback((newName) => {
        if (!newName) return;
        localStorage.setItem('netdrop_device_name', newName);

        setDeviceInfo(prev => {
            const updated = { ...prev, name: newName };
            dispatch(setMyDevice(updated));
            return updated;
        });
    }, [dispatch]);

    return { ...deviceInfo, renameDevice };
};
