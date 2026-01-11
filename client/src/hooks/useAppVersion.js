import { useState, useEffect } from 'react';
import { remoteConfig, fetchAndActivate, getValue } from '../config/firebase.config';

const DEFAULT_VERSION = 'v2.2.4';

export const useAppVersion = () => {
    const [version, setVersion] = useState(DEFAULT_VERSION);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                await fetchAndActivate(remoteConfig);
                const versionValue = getValue(remoteConfig, 'app_version');
                const fetchedVersion = versionValue.asString();
                if (fetchedVersion) {
                    setVersion(fetchedVersion);
                }
            } catch (error) {
                // Silently fall back to default version
            } finally {
                setLoading(false);
            }
        };

        fetchVersion();
    }, []);

    return { version, loading };
};
