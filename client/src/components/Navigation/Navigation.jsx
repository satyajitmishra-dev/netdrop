import React from 'react';
import { Zap, Link, Users, Lock, Info, LogOut, User as UserIcon } from 'lucide-react';

const Navigation = ({
    activeTab,
    onTabChange,
    isAuthenticated,
    user,
    onLogout
}) => {
    const navItems = [
        { id: 'local', icon: Zap, label: 'Local' },
        { id: 'remote', icon: Link, label: 'Remote' },
        { id: 'room', icon: Users, label: 'Room' },
        { id: 'vault', icon: Lock, label: 'Vault' }
    ];

    return (
        <>
            {/* Desktop Navigation - Single Row: Logo | Space | Nav Items | Info | Profile */}
            <nav className="hidden md:flex absolute top-0 w-full px-4 lg:px-6 py-4 items-center z-50">
                {/* Logo */}
                <div className="flex items-center gap-2 lg:gap-3">
                    <div className="relative w-9 h-9">
                        <div className="absolute inset-0 bg-blue-500 rounded-xl rotate-6 opacity-20" />
                        <div className="absolute inset-0 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight">NetDrop</h1>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Nav Items - Inline */}
                <div className="flex items-center gap-1">
                    {navItems.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`h-9 px-3 lg:px-4 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2
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
                <button
                    className="ml-3 lg:ml-4 h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    title="About"
                >
                    <Info size={16} />
                </button>

                {/* Profile */}
                {isAuthenticated ? (
                    <div className="ml-2 lg:ml-3 h-9 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg px-2 transition-all">
                        <img src={user?.photoURL} alt="User" className="w-6 h-6 rounded-full border border-blue-500/30" />
                        <button
                            onClick={onLogout}
                            className="hidden lg:flex text-xs font-semibold text-slate-300 hover:text-red-400 transition-colors items-center gap-1 pr-1"
                        >
                            Logout
                            <LogOut size={12} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => onTabChange('vault')}
                        className="ml-2 lg:ml-3 h-9 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-sm font-semibold"
                        title="Sign In"
                    >
                        <UserIcon size={16} />
                        <span className="hidden lg:inline">Login</span>
                    </button>
                )}
            </nav>

            {/* Mobile - Top Bar with Logo & Actions */}
            <nav className="md:hidden absolute top-0 w-full p-3 flex justify-between items-center z-50">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 bg-blue-500 rounded-lg rotate-6 opacity-20" />
                        <div className="absolute inset-0 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <h1 className="text-base font-bold text-white tracking-tight">NetDrop</h1>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400"
                        title="About"
                    >
                        <Info size={16} />
                    </button>
                    {isAuthenticated ? (
                        <button onClick={onLogout}>
                            <img src={user?.photoURL} alt="User" className="w-8 h-8 rounded-full border border-blue-500/30" />
                        </button>
                    ) : (
                        <button
                            onClick={() => onTabChange('vault')}
                            className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400"
                            title="Sign In"
                        >
                            <UserIcon size={16} />
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden absolute bottom-0 w-full z-50 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 pb-6 pt-2 px-2">
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
        </>
    );
};

export default Navigation;
