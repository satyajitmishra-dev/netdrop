import React, { useState } from 'react';
import { Zap, Link, Users, Lock, Info, LogOut, User as UserIcon } from 'lucide-react';
import SocketStatus from './SocketStatus';
import AboutModal from '../UI/AboutModal';

const Navigation = ({
    activeTab,
    onTabChange,
    isAuthenticated,
    user,
    onLogout
}) => {
    const [showAbout, setShowAbout] = useState(false);
    const navItems = [
        { id: 'local', icon: Zap, label: 'Local' },
        { id: 'remote', icon: Link, label: 'Remote' },
        { id: 'room', icon: Users, label: 'Room' },
        { id: 'vault', icon: Lock, label: 'Vault' }
    ];

    return (
        <>
            {/* Desktop Navigation - Single Row: Logo | Space | Nav Items | Info | Profile */}
            <nav className="hidden md:flex sticky top-0 w-full px-4 lg:px-6 py-4 items-center z-50 pointer-events-none data-[scrolled=true]:bg-slate-950/80 data-[scrolled=true]:backdrop-blur-md transition-colors duration-300">
                <div className="flex items-center gap-2 lg:gap-3 pointer-events-auto">
                    {/* Logo content */}
                    <div className="relative w-9 h-9 flex items-center justify-center">
                        <img src="/logo.svg" alt="NetDrop" className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                    </div>
                    <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight">NetDrop</h1>
                    <div className="ml-4">
                        <SocketStatus />
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Nav Items - Inline */}
                <div className="flex items-center gap-1 pointer-events-auto">
                    {navItems.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`h-11 px-4 lg:px-5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2
                                ${activeTab === tab.id
                                    ? 'text-white bg-blue-600 shadow-lg shadow-blue-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <tab.icon size={16} />
                            <span className="hidden lg:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Info Button */}
                <div className="flex items-center ml-3 lg:ml-4 pointer-events-auto">
                    <button
                        onClick={() => setShowAbout(true)}
                        className="h-11 w-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
                        title="About"
                    >
                        <Info size={20} />
                    </button>

                    {/* Profile */}
                    {isAuthenticated ? (
                        <div className="ml-2 lg:ml-3 h-11 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-2 transition-all">
                            <img src={user?.photoURL} alt="User" className="w-8 h-8 rounded-full border border-blue-500/30" />
                            <button
                                onClick={onLogout}
                                className="hidden lg:flex text-xs font-semibold text-slate-300 hover:text-red-400 transition-colors items-center gap-1 pr-1"
                            >
                                Logout
                                <LogOut size={14} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onTabChange('vault')}
                            className="ml-2 lg:ml-3 h-11 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm font-semibold"
                            title="Sign In"
                        >
                            <UserIcon size={20} />
                            <span className="hidden lg:inline">Login</span>
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile - Top Bar with Logo & Actions */}
            <nav className="md:hidden sticky top-0 w-full p-3 flex justify-between items-center z-50 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-auto">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <img src="/logo.svg" alt="NetDrop" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                    </div>
                    <h1 className="text-base font-bold text-white tracking-tight">NetDrop</h1>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <SocketStatus />
                    <button
                        onClick={() => setShowAbout(true)}
                        className="w-11 h-11 rounded-full bg-slate-800/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 active:scale-95 transition-transform"
                        title="About"
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
                            title="Sign In"
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

            {/* About Modal */}
            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        </>
    );
};

export default Navigation;
