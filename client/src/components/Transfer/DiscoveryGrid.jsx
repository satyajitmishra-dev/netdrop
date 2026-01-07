import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Monitor, Laptop, Tablet, Zap } from 'lucide-react';

const DiscoveryGrid = ({ peers = [], onSelectPeer, onRightClickPeer, myDeviceName, isEditingName, onEditName, onNameChange }) => {

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

    const getDeviceIcon = (type) => {
        if (type === 'mobile') return <Smartphone size={32} strokeWidth={1.5} />;
        if (type === 'tablet') return <Tablet size={32} strokeWidth={1.5} />;
        return <Laptop size={32} strokeWidth={1.5} />;
    };

    // Filter self from peers list
    const filteredPeers = peers.filter(p => p.name !== myDeviceName);

    return (
        <div className="relative w-full h-full min-h-[500px] flex justify-center overflow-hidden">

            {/* --- Premium Radar Ripples (Full Screen Cover) --- */}
            <div className="absolute inset-x-0 bottom-24 flex items-center justify-center pointer-events-none">
                {[1, 2, 3].map((ring) => (
                    <motion.div
                        key={`ring-${ring}`}
                        initial={{ opacity: 0, scale: 0.1 }}
                        animate={{
                            opacity: [0, 0.2, 0],
                            scale: [0.1, 1.8, 3.5],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            delay: ring * 1.5,
                            ease: "easeOut"
                        }}
                        className="absolute rounded-full border border-blue-500/20 bg-blue-500/5 origin-center"
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
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-900/90 backdrop-blur-xl flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)] ring-1 ring-white/10 transition-transform group-hover:scale-105 group-hover:bg-slate-800">
                        <Monitor size={32} className="md:hidden" strokeWidth={1.2} />
                        <Monitor size={40} className="hidden md:block" strokeWidth={1.2} />
                    </div>
                    {/* Status Dot */}
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 z-10 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                </div>

                {/* Identity Text */}
                <div className="flex flex-col items-center text-center space-y-1">
                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider opacity-60">
                        You are known in network as
                    </p>

                    {/* Editable Name */}
                    <div className="relative group/edit">
                        {isEditingName ? (
                            <input
                                autoFocus
                                type="text"
                                className="bg-transparent border-b border-blue-500 text-white font-bold text-lg w-48 focus:outline-none text-center py-1"
                                defaultValue={myDeviceName}
                                onBlur={onNameChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.target.blur();
                                }}
                            />
                        ) : (
                            <h3
                                className="text-white font-bold text-xl cursor-pointer hover:text-blue-400 transition-colors flex items-center gap-2"
                                onClick={onEditName}
                                title="Click to rename"
                            >
                                {myDeviceName || 'My Device'}
                                <span className="opacity-0 group-hover/edit:opacity-100 text-[10px] text-blue-500 transition-opacity">✎</span>
                            </h3>
                        )}
                    </div>

                    {/* Tagline */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-blue-500/30"></span>
                        <p className="text-blue-400/60 text-[10px] font-semibold tracking-[0.2em] uppercase">
                            Safe • Secure • Fast
                        </p>
                        <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-blue-500/30"></span>
                    </div>
                </div>
            </div>


            {/* --- Peers Area (Upper Arc) --- */}
            {/* --- Peers Area (Upper Arc) --- */}
            <div className="absolute inset-0 z-40" ref={containerRef}>
                <AnimatePresence>
                    {filteredPeers.map((peer, index) => {
                        const totalPeers = filteredPeers.length;

                        // Define the "green zone" boundaries (percentage)
                        const topBoundary = 20;
                        const bottomBoundary = 55;
                        const leftBoundary = 5;
                        const rightBoundary = 95;
                        const zoneHeight = bottomBoundary - topBoundary;
                        const zoneWidth = rightBoundary - leftBoundary;

                        // Seeded random
                        const seed = peer.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const seededRandom = (offset = 0) => {
                            const x = Math.sin(seed + offset) * 10000;
                            return x - Math.floor(x);
                        };

                        // Slot-based positioning to guarantee no overlaps
                        // Grid configuration: More columns than rows for landscape spread
                        const count = Math.max(totalPeers, 1);
                        // Calculate ideal grid dimensions
                        let cols = Math.ceil(Math.sqrt(count));
                        let rows = Math.ceil(count / cols);

                        // Adjust aspect ratio if too square for landscape container
                        if (window.innerWidth > window.innerHeight && rows > 2) {
                            cols = Math.ceil(count / 2);
                            rows = 2;
                        }

                        const slotWidth = zoneWidth / cols;
                        const slotHeight = zoneHeight / rows;

                        const row = Math.floor(index / cols);
                        const col = index % cols;

                        // Calculate base position (center of slot)
                        const baseX = leftBoundary + col * slotWidth + slotWidth / 2;
                        const baseY = topBoundary + row * slotHeight + slotHeight / 2;

                        // Add safe jitter (max 30% of slot size to keep inside slot)
                        // Use alternating jitter directions based on row/col to reduce visual grids
                        const jitterX = (seededRandom(1) - 0.5) * slotWidth * 0.6;
                        const jitterY = (seededRandom(2) - 0.5) * slotHeight * 0.6;

                        const leftPercent = baseX + jitterX;
                        const topPercent = baseY + jitterY;

                        // Clamp values to stay within bounds
                        const clampedLeft = Math.max(leftBoundary + 4, Math.min(rightBoundary - 4, leftPercent));
                        const clampedTop = Math.max(topBoundary + 4, Math.min(bottomBoundary - 4, topPercent));

                        return (
                            <motion.div
                                key={peer.id}
                                drag
                                dragConstraints={containerRef}
                                dragElastic={0.2}
                                dragMomentum={false}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ delay: index * 0.08, type: 'spring', stiffness: 200 }}
                                className="absolute flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing group"
                                style={{
                                    left: `${clampedLeft}%`,
                                    top: `${clampedTop}%`,
                                    touchAction: 'none' // Important for touch dragging
                                }}
                                onMouseEnter={() => handleHoverStart(peer.id)}
                                onMouseLeave={handleHoverEnd}
                                onDragStart={handleHoverEnd}
                                onClick={(e) => { e.stopPropagation(); onSelectPeer(peer); }}
                                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onRightClickPeer && onRightClickPeer(peer); }}
                            >
                                {/* Tooltip - Move Anywhere */}
                                {tooltipPeerId === peer.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute -top-10 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none z-50 border border-slate-700"
                                    >
                                        Move anywhere
                                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-b border-r border-slate-700"></div>
                                    </motion.div>
                                )}
                                {/* Peer Icon */}
                                <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300
                                    ${peer.type === 'mobile' ? 'bg-indigo-600/40 text-indigo-200 ring-1 ring-indigo-400/60 hover:bg-indigo-500/60' : 'bg-blue-600/40 text-blue-200 ring-1 ring-blue-400/60 hover:bg-blue-500/60'}
                                    backdrop-blur-md group-hover:scale-110 group-hover:ring-2 group-hover:shadow-xl`}
                                >
                                    {React.cloneElement(getDeviceIcon(peer.type), { size: window.innerWidth < 768 ? 22 : 26 })}
                                </div>

                                {/* Peer Name - Visible */}
                                <div className="flex flex-col items-center text-center w-[130px]">
                                    <span className="text-white font-semibold text-sm drop-shadow-lg truncate w-full px-1" title={peer.name}>
                                        {peer.name || 'Device'}
                                    </span>
                                    <span className="text-slate-400 text-[10px] uppercase tracking-wider font-medium">
                                        {peer.type}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* --- Empty State (Upper Heading Instruction) --- */}
                {
                    filteredPeers.length === 0 && (
                        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-center pointer-events-none w-full px-4">
                            <h1 className="text-white text-2xl md:text-4xl font-bold mb-4 tracking-tight drop-shadow-xl w-full mx-auto text-center px-4">
                                Open <span className="text-blue-400">NetDrop</span> on other devices
                            </h1>
                            <p className="text-slate-400 text-base md:text-xl font-light tracking-wide whitespace-nowrap">
                                Waiting for devices{loadingDots}
                            </p>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default DiscoveryGrid;
