import React from 'react';
import { Smartphone, Monitor, Laptop, Tablet, Globe, Wifi, Signal } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getShortName } from '../../utils/device';

const DeviceCard = ({
    peer,
    isHovered,
    isDragOver,
    onContextMenu,
    ...props
}) => {

    const getDeviceIcon = (type) => {
        if (type === 'mobile') return <Smartphone size={20} strokeWidth={1.5} />;
        if (type === 'tablet') return <Tablet size={20} strokeWidth={1.5} />;
        return <Laptop size={20} strokeWidth={1.5} />;
    };

    // Handle context menu with guaranteed preventDefault
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onContextMenu) onContextMenu(e);
        return false; // Extra prevention for older browsers
    };

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-300", // p-4->p-3, gap-3->gap-2
                "bg-surface/5 backdrop-blur-md border border-white/5 shadow-2xl group cursor-pointer select-none",
                isHovered && "bg-surface/10 border-white/10 scale-105",
                isDragOver && "ring-2 ring-success/50 bg-success/10 scale-110",
                !isDragOver && "hover:shadow-primary/20 hover:border-primary/30"
            )}
            onContextMenu={handleContextMenu}
            {...props}
        >
            {/* Status Indicator (Online/Signal) */}
            <div className="absolute top-2 right-2 flex items-center gap-1 pointer-events-none">
                <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    peer.network === 'LAN' ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-warning"
                )} />
            </div>

            {/* Device Icon Circle */}
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 pointer-events-none", // w-16->w-12, rounded-2xl->rounded-xl
                "bg-gradient-to-br from-white/10 to-transparent border border-white/5",
                isHovered ? "text-white shadow-inner" : "text-text-muted"
            )}>
                {getDeviceIcon(peer.type)}
            </div>

            {/* Info Section */}
            <div className="flex flex-col items-center text-center space-y-0.5 pointer-events-none">
                <span className="text-white font-semibold text-xs tracking-tight drop-shadow-md">
                    {getShortName(peer)}
                </span>

                {/* Micro Details */}
                <div className="flex items-center gap-1.5 text-[9px] text-text-muted font-medium uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded-full border border-white/5">
                    {peer.browser === 'Web' ? <Globe size={8} /> : <Signal size={8} />}
                    <span>{peer.browser || 'WEB'}</span>
                </div>
            </div>

            {/* Selection/Action Hint (Visible on Hover) */}
            <div className={cn(
                "absolute -bottom-10 opacity-0 transition-opacity duration-300 flex flex-col items-center gap-1 pointer-events-none",
                isHovered && "opacity-100"
            )}>
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest whitespace-nowrap">
                    Click: Send File
                </span>
                <span className="text-[9px] text-text-muted font-semibold uppercase tracking-wider whitespace-nowrap">
                    Right Click: Text
                </span>
            </div>
        </div>
    );
};

export default DeviceCard;
