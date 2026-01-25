import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Users, LogOut, MessageSquare, FileText, ArrowRight, Shield, Plus, Key, Copy, Info, X, Zap } from 'lucide-react';
import { socketService } from '../../services/socket.service';
import DiscoveryGrid from '../Transfer/DiscoveryGrid';
import TextShareModal from '../Transfer/TextShareModal';
import { getShortName } from '../../utils/device';
import GlassCard from '../UI/GlassCard';
import PremiumButton from '../UI/PremiumButton';
import Input from '../UI/Input';

const RoomManager = ({ onPeerSelect }) => {
    const dispatch = useDispatch();
    const { peers, myDevice } = useSelector((state) => state.transfer);

    // Local State
    const [mode, setMode] = useState('menu'); // 'menu' | 'create' | 'join' | 'active'
    const [roomName, setRoomName] = useState('');
    const [passcode, setPasscode] = useState('');
    const [activeRoomInfo, setActiveRoomInfo] = useState(null);
    const [isBusy, setIsBusy] = useState(false);

    // Broadcast Text State
    const [textModalOpen, setTextModalOpen] = useState(false);
    const [selectedPeer, setSelectedPeer] = useState(null);
    const [textModalMode, setTextModalMode] = useState('broadcast');
    const [showTips, setShowTips] = useState(false);
    const [showUsers, setShowUsers] = useState(false);

    // Listen for incoming broadcast text
    useEffect(() => {
        const socket = socketService.getSocket();

        const handleBroadcastText = (data) => {
            toast((t) => (
                <div onClick={() => toast.dismiss(t.id)} className="cursor-pointer">
                    <p className="font-bold text-primary text-xs mb-1">📢 BROADCAST from {getShortName(data.sender)}</p>
                    <p className="text-white text-sm">{data.text}</p>
                </div>
            ), {
                icon: '💬',
                duration: 6000,
                style: { background: '#020617', color: '#fff', border: '1px solid #0F52BA' }
            });
        };

        socket.on('room-text-received', handleBroadcastText);
        return () => socket.off('room-text-received', handleBroadcastText);
    }, []);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        const name = roomName.trim();
        if (!name) return;

        const socket = socketService.getSocket();
        if (!socket.connected) {
            toast.error("Waiting for connection...", { id: 'room-conn' });
        }

        setIsBusy(true);
        const safetyTimer = setTimeout(() => {
            setIsBusy(false);
            toast.error("Request timed out. Please try again.");
        }, 8000);

        socketService.createRoom(name, (response) => {
            clearTimeout(safetyTimer);
            setIsBusy(false);
            if (response.success) {
                setActiveRoomInfo({ name: response.roomName, passcode: response.passcode });
                setMode('active');
                toast.success(`Created Room: ${response.roomName}`);
            } else {
                toast.error("Failed to create room");
            }
        });
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        const code = passcode.trim();
        if (!code) return;

        const socket = socketService.getSocket();
        if (!socket.connected) {
            toast.error("Waiting for connection...", { id: 'room-conn' });
        }

        setIsBusy(true);
        const safetyTimer = setTimeout(() => {
            setIsBusy(false);
            toast.error("Request timed out. Please try again.");
        }, 8000);

        socketService.joinRoomByCode(code, (response) => {
            clearTimeout(safetyTimer);
            setIsBusy(false);
            if (response.success) {
                setActiveRoomInfo({ name: response.roomName, passcode: code });
                setMode('active');
                toast.success(`Joined Room: ${response.roomName}`);
            } else {
                toast.error(response.error || "Failed to join room");
            }
        });
    };

    const handleLeave = () => {
        socketService.leaveRoom();
        setActiveRoomInfo(null);
        setRoomName('');
        setPasscode('');
        setMode('menu');
        toast.success("Returned to Local Network");
    };

    const handleBroadcastText = (text) => {
        if (mode !== 'active') return;

        if (textModalMode === 'peer' && selectedPeer) {
            import('../../services/webrtc.service').then(({ webRTCService }) => {
                webRTCService.connectToPeer(selectedPeer.id, {
                    type: 'text',
                    content: text,
                    sender: { ...myDevice, id: socketService.getSocket()?.id }
                });
                toast.success(`Sent to ${getShortName(selectedPeer)}`);
            });
        } else {
            socketService.broadcastText(text, { ...myDevice, id: socketService.getSocket()?.id });
            toast.success("Message broadcasted to room!");
        }

        setTextModalOpen(false);
        setSelectedPeer(null);
        setTextModalMode('broadcast');
    };

    const handlePeerTextShare = (peer) => {
        setSelectedPeer(peer);
        setTextModalMode('peer');
        setTextModalOpen(true);
    };

    const handleBroadcastFile = async () => {
        if (!peers || peers.length === 0) {
            toast.error("No peers in room to broadcast to.");
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            toast.loading(`Broadcasting ${file.name} to ${peers.length} peers...`, { id: 'broadcast-file' });

            try {
                const { webRTCService } = await import('../../services/webrtc.service');
                peers.forEach((peer, index) => {
                    setTimeout(() => {
                        webRTCService.connectToPeer(peer.id, file);
                    }, index * 500);
                });

                setTimeout(() => {
                    toast.success("Broadcast started!", { id: 'broadcast-file' });
                }, 1000);
            } catch (err) {
                console.error(err);
                toast.error("Broadcast failed", { id: 'broadcast-file' });
            }
        };
        input.click();
    };

    // --- Render Logic ---

    // 1. Menu Mode
    if (mode === 'menu') {
        return (
            <div className="w-full h-full flex items-center justify-center p-4">
                <div className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <GlassCard className="group py-10 px-8 hover:bg-white/[0.02] transition-all duration-300">
                        <div className="text-center space-y-4">
                            {/* Icon with hover effect */}
                            <div className="relative inline-block group/icon cursor-pointer">
                                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full opacity-40 group-hover/icon:opacity-80 group-hover/icon:scale-110 transition-all duration-500" />
                                <div className="relative w-20 h-20 bg-gradient-to-br from-primary/20 via-blue-500/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto ring-1 ring-primary/30 shadow-2xl shadow-primary/20 group-hover/icon:shadow-primary/40 group-hover/icon:ring-primary/50 group-hover/icon:scale-105 transition-all duration-300">
                                    <Users size={36} className="text-primary group-hover/icon:scale-110 transition-transform duration-300" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Secure Rooms</h2>
                            <p className="text-text-muted text-sm leading-relaxed">
                                Share files with a group using a private room code.
                            </p>
                        </div>

                        <div className="space-y-3 pt-6">
                            <PremiumButton
                                variant="primary"
                                onClick={() => setMode('create')}
                                className="w-full text-base py-4 h-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
                            >
                                <Plus size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                                Create New Room
                            </PremiumButton>

                            <PremiumButton
                                variant="glass"
                                onClick={() => setMode('join')}
                                className="w-full text-base py-4 h-auto hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
                            >
                                <Key size={20} className="mr-2 text-primary group-hover:scale-110 transition-transform" />
                                Join with Code
                            </PremiumButton>
                        </div>
                    </GlassCard>

                    {/* Tips */}
                    <div className="flex items-center justify-center gap-2 text-text-muted text-xs">
                        <Shield size={12} className="text-emerald-500/70" />
                        <span>Rooms are private and encrypted</span>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Create Mode
    if (mode === 'create') {
        return (
            <div className="w-full h-full flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
                    <button onClick={() => setMode('menu')} className="text-text-muted hover:text-white mb-6 flex items-center gap-2 text-sm font-medium transition-colors pl-1">
                        ← Back
                    </button>
                    <GlassCard className="group space-y-8 p-8 hover:bg-white/[0.02] transition-all duration-300">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">Create a Room</h3>
                            <p className="text-text-muted text-sm">Give it a name so others can recognize it.</p>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Room Name"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="e.g. Design Team, Project Alpha"
                                autoFocus
                            />
                        </div>

                        <PremiumButton
                            variant="primary"
                            onClick={handleCreateRoom}
                            disabled={!roomName.trim() || isBusy}
                            className="w-full py-3.5 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-2"
                        >
                            {isBusy ? "Creating..." : <>Create Room <ArrowRight size={18} className="ml-2" /></>}
                        </PremiumButton>

                        <p className="text-center text-xs text-text-muted">
                            You'll get a 6-digit code to share with others.
                        </p>
                    </GlassCard>
                </div>
            </div>
        );
    }

    // 3. Join Mode
    if (mode === 'join') {
        return (
            <div className="w-full h-full flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
                    <button onClick={() => setMode('menu')} className="text-text-muted hover:text-white mb-6 flex items-center gap-2 text-sm font-medium transition-colors pl-1">
                        ← Back
                    </button>
                    <GlassCard className="group space-y-8 p-8 hover:bg-white/[0.02] transition-all duration-300">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">Join a Room</h3>
                            <p className="text-text-muted text-sm">Enter the code shared by the room creator.</p>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Room Code"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                                placeholder="ABC123"
                                maxLength={6}
                                className="font-mono text-center tracking-[0.3em] text-2xl uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-base h-14"
                                autoFocus
                            />
                        </div>

                        <PremiumButton
                            variant="primary"
                            onClick={handleJoinRoom}
                            disabled={passcode.length < 6 || isBusy}
                            className="w-full py-3.5 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-2"
                        >
                            {isBusy ? "Joining..." : <>Join Room <ArrowRight size={18} className="ml-2" /></>}
                        </PremiumButton>

                        <p className="text-center text-xs text-text-muted">
                            Ask the room creator for the 6-digit code.
                        </p>
                    </GlassCard>
                </div>
            </div>
        );
    }

    // 4. Active Room View
    return (
        <div className="w-full h-full flex flex-col">
            {/* Room Header */}
            <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                        <Users size={16} />
                        Connected
                    </div>
                    <h2 className="text-2xl font-bold text-white">{activeRoomInfo?.name}</h2>
                </div>

                {/* Controls Bar */}
                <GlassCard className="p-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* Passcode Chip */}
                        <div
                            className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-xl border border-white/5 cursor-pointer hover:bg-slate-900/80 transition-colors group"
                            onClick={() => {
                                navigator.clipboard.writeText(activeRoomInfo?.passcode);
                                toast.success('Room code copied!');
                            }}
                            title="Click to copy"
                        >
                            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Code</span>
                            <span className="font-mono text-lg font-bold text-white tracking-widest group-hover:text-primary transition-colors">{activeRoomInfo?.passcode}</span>
                            <Copy size={14} className="text-text-muted group-hover:text-white" />
                        </div>

                        {/* User Count */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUsers(!showUsers)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${peers.length > 0
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                    : 'bg-white/5 text-text-muted border-transparent hover:bg-white/10'
                                    }`}
                            >
                                <Users size={16} />
                                {peers.length}
                            </button>
                            {/* Users Popover */}
                            {showUsers && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-2 py-1 flex justify-between items-center border-b border-white/5 mb-1 pb-1">
                                        <span className="text-xs font-bold text-white">Users</span>
                                        <X size={12} className="cursor-pointer text-text-muted hover:text-white" onClick={() => setShowUsers(false)} />
                                    </div>
                                    <ul className="max-h-40 overflow-y-auto">
                                        {peers.length === 0 ? (
                                            <li className="text-xs text-text-muted px-2 py-1">Nothing here...</li>
                                        ) : (
                                            peers.map(p => (
                                                <li key={p.id} className="text-xs text-white px-2 py-1 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    {getShortName(p)}
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <PremiumButton variant="glass" onClick={() => setTextModalOpen(true)} className="px-3 py-2 text-xs h-auto">
                            <MessageSquare size={16} className="text-primary mr-2" />
                            Send Message
                        </PremiumButton>
                        <PremiumButton variant="glass" onClick={handleBroadcastFile} className="px-3 py-2 text-xs h-auto">
                            <Zap size={16} className="text-emerald-400 mr-2" />
                            Send File
                        </PremiumButton>
                        <button
                            onClick={handleLeave}
                            className="p-2.5 text-error hover:bg-error/10 rounded-xl transition-colors"
                            title="Leave Room"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </GlassCard>
            </div>

            {/* Waiting State (Empty) */}
            {peers.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center -mt-20">
                    <div className="relative">
                        <div className="absolute inset-0 w-24 h-24 bg-primary/20 rounded-full animate-ping" />
                        <div className="absolute inset-4 w-16 h-16 bg-primary/10 rounded-full animate-pulse" />
                        <div className="relative w-24 h-24 bg-surface/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
                            <Users size={32} className="text-white/50" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-8">Waiting for people to join...</h3>
                    <p className="text-text-muted text-sm mt-2 mb-6">Share the code <span className="text-white font-mono font-bold tracking-widest">{activeRoomInfo?.passcode}</span> to connect</p>
                </div>
            )}

            {/* Peer Grid */}
            {peers.length > 0 && (
                <div className="flex-1 w-full overflow-hidden relative">
                    <div className="absolute inset-0 overflow-y-auto pb-20 scrollbar-hide">
                        <div className="w-full max-w-[1600px] mx-auto px-4">
                            <DiscoveryGrid
                                peers={peers}
                                onSelectPeer={(peer) => {
                                    if (onPeerSelect) onPeerSelect(peer);
                                }}
                                myDeviceName={myDevice?.name}
                                myDeviceType={myDevice?.type}
                                onRightClickPeer={handlePeerTextShare}
                            />
                        </div>
                    </div>
                </div>
            )}

            <TextShareModal
                isOpen={textModalOpen}
                onClose={() => {
                    setTextModalOpen(false);
                    setSelectedPeer(null);
                    setTextModalMode('broadcast');
                }}
                mode="send"
                peerName={textModalMode === 'peer' && selectedPeer ? getShortName(selectedPeer) : `Everyone in ${activeRoomInfo?.name}`}
                onSend={handleBroadcastText}
            />
        </div>
    );
};

export default RoomManager;
