import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Monitor, Laptop, Tablet, Zap, Globe, Wifi, Network } from 'lucide-react';
import { socketService } from '../../services/socket.service';
import { getShortName, isDefaultDeviceName } from '../../utils/device';
import { useSound } from '../../hooks/useSound';
import DeviceCard from './DeviceCard';

const DiscoveryGrid = ({ peers = [], onSelectPeer, onRightClickPeer, myDeviceName, myDeviceType, myDeviceBrowser, myDeviceNetwork, isEditingName, onEditName, onNameChange, onPeerDrop }) => {
    const [dragOverPeerId, setDragOverPeerId] = React.useState(null);
    const mySocketId = socketService.socket?.id;
    const { playConnect } = useSound();

    // Filter self from peers list using ID for safety, fallback to name
    const [filteredPeers, setFilteredPeers] = React.useState([]);

    React.useEffect(() => {
        // Use ID filtering if available, otherwise name (legacy)
        const filtered = peers.filter(p => {
            if (mySocketId) return p.id !== mySocketId;
            return p.name !== myDeviceName;
        });
        setFilteredPeers(filtered);
    }, [peers, mySocketId, myDeviceName]);

    const [loadingDots, setLoadingDots] = React.useState('');
    const [tooltipPeerId, setTooltipPeerId] = React.useState(null);
    const hoverTimerRef = React.useRef(null);
    const containerRef = React.useRef(null);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setLoadingDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const handleHoverStart = (id) => {
        hoverTimerRef.current = setTimeout(() => {
            setTooltipPeerId(id);
        }, 2000);
    };

    const handleHoverEnd = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setTooltipPeerId(null);
    };

    return (
        <div className="relative w-full h-full min-h-[500px] flex justify-center overflow-hidden">

            {/* --- Premium Radar Ripples (Full Screen Cover) --- */}
            <div className="absolute inset-x-0 bottom-24 flex items-center justify-center pointer-events-none">
                {[1, 2, 3].map((ring) => (
                    <motion.div
                        key={`ring-${ring}`}
                        initial={{ opacity: 0, scale: 0.1 }}
                        animate={{
                            opacity: [0, 0.1, 0],
                            scale: [0.1, 1.8, 3.5],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            delay: ring * 1.5,
                            ease: "easeOut"
                        }}
                        className="absolute rounded-full border border-primary/20 bg-primary/5 origin-center"
                        style={{
                            width: '40vh',
                            height: '40vh',
                            bottom: '-20vh'
                        }}
                    />
                ))}
            </div>


            {/* --- My Device (Bottom Center) --- */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-full max-w-md">

                {/* Device Icon */}
                <div className="relative group cursor-pointer mb-2" onClick={onEditName}>
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-surface/10 backdrop-blur-xl flex items-center justify-center text-primary shadow-[0_0_30px_rgba(15,82,186,0.2)] border border-white/10 transition-transform group-hover:scale-105 group-hover:bg-surface/20">
                        <Monitor size={32} className="md:hidden" strokeWidth={1.5} />
                        <Monitor size={40} className="hidden md:block" strokeWidth={1.5} />
                    </div>
                    {/* Status Dot */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-success rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
                    </div>
                </div>

                {/* Identity Text */}
                <div className="flex flex-col items-center text-center space-y-1">
                    <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider opacity-60">
                        You
                    </p>

                    {/* Editable Name */}
                    <div className="relative group/edit">
                        {isEditingName ? (
                            <input
                                autoFocus
                                type="text"
                                className="bg-transparent border-b border-primary text-white font-bold text-lg w-48 focus:outline-none text-center py-1"
                                defaultValue={
                                    isDefaultDeviceName(myDeviceName)
                                        ? getShortName({ name: myDeviceName, type: myDeviceType, id: mySocketId || '????' })
                                        : myDeviceName
                                }
                                onBlur={onNameChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.target.blur();
                                }}
                            />
                        ) : (
                            <h3
                                className="text-white font-bold text-xl cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                                onClick={onEditName}
                                title="Click to rename"
                            >
                                {getShortName({ name: myDeviceName, type: myDeviceType, id: mySocketId || '????' })}
                                <span className="opacity-0 group-hover/edit:opacity-100 text-[10px] text-primary transition-opacity">✎</span>
                            </h3>
                        )}
                    </div>

                    {/* Tagline */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-semibold tracking-wider text-text-muted uppercase flex items-center gap-2">
                            {myDeviceBrowser || 'WEB'}
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            {myDeviceNetwork || 'UNKNOWN'}
                        </div>
                    </div>
                </div>
            </div>


            {/* --- Peers Area (Safe Grid Zone) --- */}
            <div
                className="absolute inset-x-0 top-16 md:top-0 bottom-[25%] md:bottom-[35%] z-40 flex items-start justify-center p-2 md:p-8 pointer-events-none"
                ref={containerRef}
            >
                <div className="w-full max-w-7xl h-full flex flex-wrap content-start justify-center gap-2 md:gap-4 pointer-events-auto overflow-y-auto scrollbar-hide">
                    <AnimatePresence mode="popLayout">
                        {filteredPeers.map((peer) => (
                            <motion.div
                                key={peer.id}
                                layoutId={peer.id}
                                initial={{ scale: 0, opacity: 0, y: 20 }}
                                animate={{
                                    scale: 0.85, // Reduced scale for better density
                                    opacity: 1,
                                    y: 0,
                                }}
                                whileHover={{ scale: 1, zIndex: 100 }} // Zoom on hover
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 25,
                                    layout: { duration: 0.2 }
                                }}
                                className="relative z-50 origin-center"
                                onMouseEnter={() => handleHoverStart(peer.id)}
                                onMouseLeave={handleHoverEnd}
                                onClick={(e) => { e.stopPropagation(); onSelectPeer(peer); }}
                                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onRightClickPeer && onRightClickPeer(peer, e); }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragOverPeerId(peer.id);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragOverPeerId(null);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragOverPeerId(null);
                                    if (onPeerDrop) onPeerDrop(peer, e.dataTransfer.items);
                                }}
                            >
                                <DeviceCard
                                    peer={peer}
                                    isHovered={tooltipPeerId === peer.id}
                                    isDragOver={dragOverPeerId === peer.id}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* --- Empty State --- */}
                {
                    filteredPeers.length === 0 && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-full px-4">
                            <h1 className="text-white text-3xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-2xl">
                                Looking for <span className="text-primary italic">devices...</span>
                            </h1>
                            <p className="text-text-muted text-base md:text-lg font-light tracking-wide bg-surface/5 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                                Open NetDrop on another device to start
                                <span className="inline-block w-8 text-left">{loadingDots}</span>
                            </p>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default DiscoveryGrid;
