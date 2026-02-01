import { useState, useEffect } from 'react';
import { remoteConfig, fetchAndActivate, getValue } from '../config/firebase.config';

export const useWelcome = () => {
    const [welcome, setWelcome] = useState({
        enabled: false,
        title: 'Welcome to NetDrop! 🎉',
        steps: [],
        loading: true
    });

    useEffect(() => {
        const fetchWelcomeConfig = async () => {
            try {
                await fetchAndActivate(remoteConfig);

                const enabled = getValue(remoteConfig, 'welcome_enabled').asBoolean();
                const title = getValue(remoteConfig, 'welcome_title').asString() || 'Welcome to NetDrop! 🎉';
                const stepsJson = getValue(remoteConfig, 'welcome_steps').asString();

                let steps = [];
                if (stepsJson) {
                    try {
                        steps = JSON.parse(stepsJson);
                    } catch (e) {
                        console.warn('Failed to parse welcome steps:', e);
                    }
                }

                setWelcome({
                    enabled,
                    title,
                    steps,
                    loading: false
                });
            } catch (error) {
                console.warn('Welcome config fetch failed:', error);
                setWelcome(prev => ({ ...prev, loading: false }));
            }
        };

        fetchWelcomeConfig();
    }, []);

    return welcome;
};
