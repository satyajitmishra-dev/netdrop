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

        return { type, defaultName: `${defaultName}-${Math.floor(Math.random() * 1000)}` };
    };

    useEffect(() => {
        const { type, defaultName } = detectDevice();

        // Load saved name or use default
        let savedName = localStorage.getItem('netdrop_device_name');
        if (!savedName) {
            savedName = defaultName;
            localStorage.setItem('netdrop_device_name', savedName);
        }

        const info = { name: savedName, type };
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
