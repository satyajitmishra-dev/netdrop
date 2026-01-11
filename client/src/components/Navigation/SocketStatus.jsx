import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { socketService } from '../../services/socket.service';

const SocketStatus = () => {
    const [status, setStatus] = useState('disconnected'); // 'connected' | 'reconnecting' | 'disconnected'
    const [ping, setPing] = useState(0);

    useEffect(() => {
        const socket = socketService.getSocket();

        const onConnect = () => {
            setStatus('connected');
            // Measure latency roughly
            const start = Date.now();
            socket.emit('ping', () => {
                setPing(Date.now() - start);
            });
        };

        const onDisconnect = () => setStatus('disconnected');
        const onReconnectAttempt = () => setStatus('reconnecting');
        const onConnectError = () => setStatus('disconnected');

        // Initial state
        if (socket.connected) {
            setStatus('connected');
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('reconnect_attempt', onReconnectAttempt);
        socket.on('connect_error', onConnectError);

        // Ping interval
        const interval = setInterval(() => {
            if (socket.connected) {
                const start = Date.now();
                socket.emit('ping', () => setPing(Date.now() - start));
            }
        }, 10000);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('reconnect_attempt', onReconnectAttempt);
            socket.off('connect_error', onConnectError);
            clearInterval(interval);
        };
    }, []);

    // Visuals based on status
    const statusConfig = {
        connected: {
            color: 'bg-emerald-500',
            text: 'text-emerald-500',
            label: 'Online',
            icon: Wifi
        },
        reconnecting: {
            color: 'bg-amber-500',
            text: 'text-amber-500',
            label: 'Reconnecting...',
            icon: WifiOff
        },
        disconnected: {
            color: 'bg-rose-500',
            text: 'text-rose-500',
            label: 'Offline',
            icon: WifiOff
        }
    };

    const current = statusConfig[status];
    const Icon = current.icon;

    if (status === 'connected') {
        // Minimal dot for connected state
        return (
            <div className="group relative flex items-center h-8 px-2 rounded-full hover:bg-white/5 transition-all cursor-help" title={`Connected • ${ping}ms latency`}>
                <div className="relative flex items-center justify-center w-2.5 h-2.5">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${current.color}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${current.color}`}></span>
                </div>
                {/* Tooltip on hover */}
                <span className="hidden group-hover:block absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-900 text-xs text-slate-300 px-2 py-1 rounded border border-white/10 whitespace-nowrap z-50">
                    NetDrop Network • {ping}ms
                </span>
            </div>
        );
    }

    // Expanded pill for offline/issues
    return (
        <div className={`flex items-center gap-2 h-8 px-3 rounded-full bg-slate-900 border border-white/10 ${status === 'reconnecting' ? 'animate-pulse' : ''}`}>
            <Icon size={14} className={current.text} />
            <span className={`text-xs font-bold ${current.text}`}>
                {current.label}
            </span>
        </div>
    );
};

export default SocketStatus;
