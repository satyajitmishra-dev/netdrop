import { useCallback, useEffect, useRef } from 'react';

export const useSound = () => {
    const audioContext = useRef(null);

    useEffect(() => {
        // Initialize AudioContext on user interaction if needed, or lazily
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioContext.current = new AudioContext();
        }
    }, []);

    const playTone = useCallback((freq, type, duration, delay = 0, vol = 0.1) => {
        if (!audioContext.current) return;
        const ctx = audioContext.current;

        // Resume context if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

        gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
    }, []);

    const playSuccess = useCallback(() => {
        playTone(880, 'sine', 0.1, 0, 0.1); // A5
        playTone(1108, 'sine', 0.3, 0.1, 0.1); // C#6
    }, [playTone]);

    const playError = useCallback(() => {
        playTone(150, 'sawtooth', 0.1, 0, 0.1);
        playTone(100, 'sawtooth', 0.3, 0.1, 0.1);
    }, [playTone]);

    const playPop = useCallback(() => {
        playTone(600, 'sine', 0.05, 0, 0.05);
    }, [playTone]);

    const playConnect = useCallback(() => {
        playTone(400, 'sine', 0.1, 0, 0.05);
        playTone(600, 'sine', 0.2, 0.1, 0.05);
    }, [playTone]);

    return {
        playSuccess,
        playError,
        playPop,
        playConnect
    };
};
