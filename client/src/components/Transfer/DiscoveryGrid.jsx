import React from 'react';
import { Smartphone, Monitor } from 'lucide-react'; // Assuming these icons are intended to be imported

const DiscoveryGrid = ({ peers = [], onSelectPeer, onRightClickPeer }) => {
    return (
        <div className="relative w-96 h-96 flex items-center justify-center">
            {/* Radar Scanning Effect */}
            <div className="absolute inset-0 rounded-full border border-secondary/20 animate-pulse-slow" />
            <div className="absolute inset-4 rounded-full border border-secondary/10" />
            <div className="absolute inset-1/4 rounded-full border border-secondary/5" />

            {/* Scanning Line */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-secondary/10 origin-right animate-[spin_4s_linear_infinite]" />
            </div>

            {/* Me (Center) */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-surface border-2 border-secondary shadow-[0_0_30px_rgba(37,99,235,0.3)] flex flex-col items-center justify-center">
                <div className="w-3 h-3 bg-secondary rounded-full animate-ping absolute top-2 right-2" />
                <span className="text-2xl">👤</span>
                <span className="text-xs font-bold text-secondary mt-1">Me</span>
            </div>

            {/* Peers (Orbiting) */}
            {peers.map((peer, index) => {
                // Calculate random-ish positions on the orbit for demo purposes
                // In real app, we might want fixed slots or physics-based layout
                const angle = (index / peers.length) * 2 * Math.PI;
                const radius = 140; // px
                // Original calculation for top/left was based on percentage, new one uses px for transform
                // Let's adapt to use px for transform as per the instruction's style
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                    <button
                        key={peer.id}
                        className="absolute group flex flex-col items-center justify-center transition-all duration-500 hover:scale-110 z-10"
                        style={{
                            transform: `translate(${x}px, ${y}px)`,
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
                        {/* Peer Icon */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg transition-all duration-300
                            ${peer.type === 'mobile'
                                ? 'bg-indigo-500/20 border border-indigo-500/50 shadow-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white'
                                : 'bg-secondary/20 border border-secondary/50 shadow-secondary/20 text-secondary group-hover:bg-secondary group-hover:text-white'
                            }`}
                        >
                            {peer.type === 'mobile' ? <Smartphone size={24} /> : <Monitor size={24} />}
                        </div>

                        {/* Name Tag */}
                        <span className="mt-2 text-xs font-medium text-slate-400 bg-slate-900/80 px-2 py-1 rounded-full border border-slate-700/50 group-hover:border-slate-600 transition-colors">
                            {peer.name || 'Device'}
                        </span>
                    </button>
                );
            })}

            {peers.length === 0 && (
                <div className="absolute bottom-4 text-center w-full">
                    <p className="text-sm text-text-muted animate-pulse">Scanning for devices...</p>
                </div>
            )}
        </div>
    );
};

export default DiscoveryGrid;
