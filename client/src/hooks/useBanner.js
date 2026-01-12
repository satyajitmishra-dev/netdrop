import { useState, useEffect } from 'react';
import { remoteConfig, fetchAndActivate, getValue } from '../config/firebase.config';

export const useBanner = () => {
    const [banner, setBanner] = useState({
        enabled: false,
        text: '',
        link: '',
        type: 'info', // info | promo | warning
        loading: true
    });

    useEffect(() => {
        const fetchBannerConfig = async () => {
            try {
                await fetchAndActivate(remoteConfig);

                const enabled = getValue(remoteConfig, 'banner_enabled').asBoolean();
                const text = getValue(remoteConfig, 'banner_text').asString();
                const link = getValue(remoteConfig, 'banner_link').asString();
                const type = getValue(remoteConfig, 'banner_type').asString() || 'info';
                const detail = getValue(remoteConfig, 'banner_detail').asString();

                setBanner({
                    enabled,
                    text,
                    link,
                    type,
                    detail,
                    loading: false
                });
            } catch (error) {
                console.warn('Banner config fetch failed:', error);
                setBanner(prev => ({ ...prev, loading: false }));
            }
        };

        fetchBannerConfig();
    }, []);

    return banner;
};
