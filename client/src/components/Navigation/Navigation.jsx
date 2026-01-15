import React, { useState } from 'react';
import { Zap, Link, Users, Lock, Info, LogOut, User as UserIcon, Download, Clock } from 'lucide-react';
import SocketStatus from './SocketStatus';
import AboutModal from '../UI/AboutModal';
import Tooltip from '../UI/Tooltip';
import { usePWAInstall } from '../../hooks/usePWAInstall';

// ... (imports remain same)

const Navigation = ({
    activeTab,
    onTabChange,
    isAuthenticated,
    user,
    onLogout
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
            <nav className="hidden md:flex sticky top-0 w-full px-4 lg:px-6 py-4 items-center z-50 pointer-events-none data-[scrolled=true]:bg-slate-950/80 data-[scrolled=true]:backdrop-blur-md transition-colors duration-300">
                {/* ... Logo Section ... */}
                <div className="flex items-center gap-2 lg:gap-3 pointer-events-auto">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <img src="/logo.svg" alt="NetDrop" className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                    </div>
                    <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">NetDrop</h1>
                    <div className="ml-4">
                        <SocketStatus />
                    </div>
                </div>

                <div className="flex-1" />

                {/* Nav Items */}
                <div className="flex items-center gap-1 pointer-events-auto">
                    {navItems.map((tab) => (
                        <Tooltip key={tab.id} content={`Switch to ${tab.label}`} position="bottom">
                            <button
                                onClick={() => onTabChange(tab.id)}
                                className={`h-11 px-4 lg:px-5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2
                                    ${activeTab === tab.id
                                        ? 'text-white bg-blue-600 shadow-lg shadow-blue-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <tab.icon size={16} />
                                <span className="hidden lg:inline">{tab.label}</span>
                            </button>
                        </Tooltip>
                    ))}
                </div>

                {/* Info & Profile */}
                <div className="flex items-center ml-3 lg:ml-4 pointer-events-auto gap-2">
                    {/* Install PWA Button */}
                    {isInstallable && (
                        <Tooltip content="Install App" position="bottom">
                            <button
                                onClick={installPWA}
                                className="h-11 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 flex items-center gap-2 transition-all active:scale-95 animate-pulse-subtle"
                            >
                                <Download size={18} />
                                <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">Install</span>
                            </button>
                        </Tooltip>
                    )}

                    <Tooltip content="About NetDrop" position="bottom">
                        <button
                            onClick={() => setShowAbout(true)}
                            className="h-11 w-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
                        >
                            <Info size={20} />
                        </button>
                    </Tooltip>

                    {isAuthenticated ? (
                        <div className="ml-2 lg:ml-3 h-11 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-2 transition-all">
                            <img src={user?.photoURL} alt="User" className="w-8 h-8 rounded-full border border-blue-500/30" />
                            <Tooltip content="Logout" position="bottom">
                                <button
                                    onClick={onLogout}
                                    className="hidden lg:flex text-xs font-semibold text-slate-300 hover:text-red-400 transition-colors items-center gap-1 pr-1"
                                >
                                    Logout
                                    <LogOut size={14} />
                                </button>
                            </Tooltip>
                        </div>
                    ) : (
                        <Tooltip content="Login to verify identity" position="bottom">
                            <button
                                onClick={() => onTabChange('vault')}
                                className="ml-2 lg:ml-3 h-11 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm font-semibold"
                            >
                                <UserIcon size={20} />
                                <span className="hidden lg:inline">Login</span>
                            </button>
                        </Tooltip>
                    )}
                </div>
            </nav>

            {/* Mobile Header */}
            <nav className="md:hidden sticky top-0 w-full p-3 flex justify-between items-center z-50 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-auto">
                <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <img src="/logo.svg" alt="NetDrop" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                    </div>
                    <h1 className="text-lg font-bold text-white tracking-tight">NetDrop</h1>
                </div>

                <div className="flex items-center gap-3">
                    <SocketStatus />
                    {isInstallable && (
                        <button
                            onClick={installPWA}
                            className="w-11 h-11 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 flex items-center justify-center text-emerald-400 active:scale-95 transition-transform"
                        >
                            <Download size={20} />
                        </button>
                    )}
                    <button
                        onClick={() => setShowAbout(true)}
                        className="w-11 h-11 rounded-full bg-slate-800/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 active:scale-95 transition-transform"
                    >
                        <Info size={22} />
                    </button>
                    {isAuthenticated ? (
                        <button onClick={onLogout} className="active:scale-95 transition-transform">
                            <img src={user?.photoURL} alt="User" className="w-11 h-11 rounded-full border border-blue-500/30" />
                        </button>
                    ) : (
                        <button
                            onClick={() => onTabChange('vault')}
                            className="w-11 h-11 rounded-full bg-slate-800/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 active:scale-95 transition-transform"
                        >
                            <UserIcon size={22} />
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 w-full z-50 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 pb-6 pt-2 px-2 safe-bottom">
                <div className="flex justify-around items-center">
                    {navItems.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[70px]
                                ${activeTab === tab.id ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500'}`}
                        >
                            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        </>
    );
};

export default Navigation;
