import React from 'react';
import { Smartphone, Monitor, Laptop, Tablet } from 'lucide-react';

const DiscoveryGrid = ({ peers = [], onSelectPeer, onRightClickPeer }) => {
    // Premium Icons based on device type (if we had that data, defaulting to generic for now)
    const getDeviceIcon = (type) => {
        if (type === 'mobile') return <Smartphone size={24} />;
        if (type === 'tablet') return <Tablet size={24} />;
        return <Laptop size={24} />;
    };

    return (
        <div className="relative w-full aspect-square max-w-[400px] mx-auto flex items-center justify-center">
            {/* Premium Radar Background */}
            <div className="absolute inset-0 rounded-full border border-secondary/10 bg-secondary/5 backdrop-blur-[2px]" />
            <div className="absolute inset-[15%] rounded-full border border-secondary/10" />
            <div className="absolute inset-[35%] rounded-full border border-secondary/5" />

            {/* Animated Scanning Radar */}
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-50">
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-secondary/10 to-secondary/30 origin-right animate-[spin_3s_linear_infinite]" />
            </div>

            {/* Me (Center) with Glow */}
            <div className="relative z-20 w-20 h-20 rounded-2xl bg-slate-900/90 border border-secondary/50 shadow-[0_0_40px_rgba(37,99,235,0.4)] flex flex-col items-center justify-center backdrop-blur-md group">
                <div className="absolute w-full h-full bg-secondary/20 rounded-2xl animate-pulse-slow blur-xl -z-10 group-hover:bg-secondary/40 transition-all" />
                <span className="text-2xl">👤</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-secondary mt-1">You</span>
            </div>

            {/* Peers (Orbiting) */}
            {peers.map((peer, index) => {
                // Responsive Positioning using Percentages
                const angle = (index / peers.length) * 2 * Math.PI;
                // Radius is ~35% of the container to fit nicely
                const radiusPercent = 35;
                const x = 50 + Math.cos(angle) * radiusPercent;
                const y = 50 + Math.sin(angle) * radiusPercent;

                return (
                    <button
                        key={peer.id}
                        className="absolute w-16 h-16 -ml-8 -mt-8 flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 z-30 group"
                        style={{
                            left: `${x}%`,
                            top: `${y}%`,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectPeer(peer);
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onRightClickPeer && onRightClickPeer(peer);
                        }}
                    >
                        {/* Peer Icon with Premium Glass Effect */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-lg transition-all duration-300 border
                            ${peer.type === 'mobile'
                                ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)] text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-indigo-500/50'
                                : 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)] text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-blue-500/50'
                            }`}
                        >
                            {getDeviceIcon(peer.type)}
                        </div>

                        {/* Name Tag */}
                        <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-semibold text-white bg-slate-900/90 px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap z-50 shadow-xl pointer-events-none">
                            {peer.name || 'Device'}
                        </span>

                        {/* Always visible shortened name for mobile if needed, but hover is cleaner for premium look */}
                        <span className="md:hidden mt-1 text-[10px] font-medium text-slate-400 truncate max-w-[80px]">
                            {peer.name}
                        </span>
                    </button>
                );
            })}

            {peers.length === 0 && (
                <div className="absolute bottom-4 text-center w-full animate-bounce">
                    <p className="text-xs text-secondary/70 tracking-widest uppercase font-semibold">Scanning...</p>
                </div>
            )}
        </div>
    );
};

export default DiscoveryGrid;
