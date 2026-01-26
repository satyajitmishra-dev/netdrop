import React, { useState } from 'react';
import { Zap, Link, Users, Lock, Info, LogOut, User as UserIcon, Download, Clock } from 'lucide-react';
import SocketStatus from './SocketStatus';
import AboutModal from '../UI/AboutModal';
import Tooltip from '../UI/Tooltip';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import PremiumButton from '../UI/PremiumButton';
import { cn } from '../../utils/cn';

const Navigation = ({
    activeTab,
    onTabChange,
    isAuthenticated,
    user,
    onLogout,
    onProfileClick
}) => {
    const [showAbout, setShowAbout] = useState(false);
    const { isInstallable, installPWA } = usePWAInstall();

    const navItems = [
        { id: 'local', icon: Zap, label: 'Local' },
        { id: 'remote', icon: Link, label: 'Remote' },
        { id: 'room', icon: Users, label: 'Room' },
        { id: 'history', icon: Clock, label: 'History' },
        { id: 'vault', icon: Lock, label: 'Vault' }
    ];

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex sticky top-0 w-full px-6 py-4 items-center z-50 pointer-events-none">
                {/* Logo Section */}
                <div className="flex items-center gap-3 pointer-events-auto bg-surface/5 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-2xl shadow-xl">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/30 rounded-full blur-md" />
                        <img src="/favicon.svg" alt="NetDrop" className="relative w-full h-full object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">NetDrop</h1>
                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                    <SocketStatus />
                </div>

                <div className="flex-1" />

                {/* Nav Items - Floating Glass Bar */}
                <div className="flex items-center gap-1 pointer-events-auto bg-surface/5 backdrop-blur-xl border border-white/5 p-1.5 rounded-2xl shadow-2xl mx-4">
                    {navItems.map((tab) => (
                        <Tooltip key={tab.id} content={tab.label} position="bottom">
                            <button
                                onClick={() => onTabChange(tab.id)}
                                className={cn(
                                    "h-10 px-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                                    activeTab === tab.id
                                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                                        : "text-text-muted hover:text-white hover:bg-white/5"
                                )}
                            >
                                <tab.icon size={18} />
                                <span className={cn("hidden lg:inline transition-all", activeTab === tab.id ? "opacity-100" : "opacity-0 lg:opacity-100")}>
                                    {tab.label}
                                </span>
                            </button>
                        </Tooltip>
                    ))}
                </div>

                <div className="flex-1" />

                {/* Right Actions */}
                <div className="flex items-center pointer-events-auto gap-2 bg-surface/5 backdrop-blur-xl border border-white/5 p-1.5 rounded-2xl shadow-xl">
                    {isInstallable && (
                        <Tooltip content="Install App">
                            <button
                                onClick={installPWA}
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-success hover:bg-success/10 transition-colors"
                            >
                                <Download size={18} />
                            </button>
                        </Tooltip>
                    )}

                    <Tooltip content="About">
                        <button
                            onClick={() => setShowAbout(true)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <Info size={18} />
                        </button>
                    </Tooltip>

                    {isAuthenticated ? (
                        <>
                            <div className="h-4 w-[1px] bg-white/10 mx-1" />
                            <Tooltip content="Profile">
                                <button
                                    onClick={onProfileClick}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 text-text-muted hover:text-white transition-colors"
                                >
                                    <img src={user?.photoURL} alt="User" className="w-6 h-6 rounded-full border border-white/10" />
                                    {/* <LogOut size={16} /> Removed direct logout icon to avoid confusion, just avatar now? Or maybe a generic user icon if image fails */}
                                </button>
                            </Tooltip>
                        </>
                    ) : (
                        <PremiumButton
                            variant="secondary"
                            size="sm"
                            onClick={() => onTabChange('vault')}
                            className="ml-2"
                        >
                            <UserIcon size={16} className="mr-2" />
                            Login
                        </PremiumButton>
                    )}
                </div>
            </nav>

            {/* Mobile Header */}
            <nav className="md:hidden sticky top-0 w-full px-4 py-3 flex justify-between items-center z-50 bg-background/80 backdrop-blur-md border-b border-white/5 pointer-events-auto">
                <div className="flex items-center gap-2">
                    <div className="relative w-9 h-9 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/25 rounded-full blur-sm" />
                        <img src="/favicon.svg" alt="NetDrop" className="relative w-full h-full object-contain drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]" />
                    </div>
                    <h1 className="text-lg font-bold text-white">NetDrop</h1>
                </div>

                <div className="flex items-center gap-3">
                    <SocketStatus />
                    <button
                        onClick={() => setShowAbout(true)}
                        className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-text-muted active:scale-95"
                    >
                        <Info size={20} />
                    </button>
                    {isAuthenticated ? (
                        <button onClick={onProfileClick} className="active:scale-95">
                            <img src={user?.photoURL} alt="User" className="w-9 h-9 rounded-full border border-white/10" />
                        </button>
                    ) : (
                        <button
                            onClick={() => onTabChange('vault')}
                            className="w-9 h-9 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center active:scale-95"
                        >
                            <UserIcon size={20} />
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 w-full z-50 bg-background/80 backdrop-blur-2xl border-t border-white/5 pb-safe pt-2 px-4 safe-bottom">
                <div className="flex justify-between items-center max-w-sm mx-auto">
                    {navItems.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
                                activeTab === tab.id ? "text-primary" : "text-text-muted hover:text-white"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-lg transition-all",
                                activeTab === tab.id ? "bg-primary/10" : "bg-transparent"
                            )}>
                                <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        </>
    );
};

export default Navigation;
