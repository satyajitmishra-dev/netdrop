import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Users, LogOut, MessageSquare, FileText, ArrowRight, Shield, Plus, Key, Copy, Info, X } from 'lucide-react';
import { socketService } from '../../services/socket.service';
import DiscoveryGrid from '../Transfer/DiscoveryGrid';
import TextShareModal from '../Transfer/TextShareModal';
import { setActiveTab } from '../../store/slices/transfer.slice';
import { getShortName } from '../../utils/device';

const RoomManager = ({ onPeerSelect }) => {
    const dispatch = useDispatch();
    const { peers, myDevice } = useSelector((state) => state.transfer);

    // Local State
    const [mode, setMode] = useState('menu'); // 'menu' | 'create' | 'join' | 'active'
    const [roomName, setRoomName] = useState('');
    const [passcode, setPasscode] = useState(''); // Input for join, Display for create
    const [activeRoomInfo, setActiveRoomInfo] = useState(null); // { name, passcode }
    const [isBusy, setIsBusy] = useState(false); // Loading state for async actions

    // Broadcast Text State
    const [textModalOpen, setTextModalOpen] = useState(false);
    const [selectedPeer, setSelectedPeer] = useState(null); // For per-peer text sharing
    const [textModalMode, setTextModalMode] = useState('broadcast'); // 'broadcast' | 'peer'
    const [showTips, setShowTips] = useState(false); // Info popover state
    const [showUsers, setShowUsers] = useState(false); // User list popover state

    // Listen for incoming broadcast text
    useEffect(() => {
        const socket = socketService.getSocket();

        const handleBroadcastText = (data) => {
            toast((t) => (
                <div onClick={() => toast.dismiss(t.id)} className="cursor-pointer">
                    <p className="font-bold text-blue-400 text-xs mb-1">📢 BROADCAST from {getShortName(data.sender)}</p>
                    <p className="text-white text-sm">{data.text}</p>
                </div>
            ), {
                icon: '💬',
                duration: 6000,
                style: { background: '#1e293b', color: '#fff', border: '1px solid #3b82f6' }
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
            // proceed anyway, socket.io buffers
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
                setActiveRoomInfo({ name: response.roomName, passcode: code }); // We might not know passcode if we joined without logic check, but here we do
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
            // Send to specific peer via WebRTC
            import('../../services/webrtc.service').then(({ webRTCService }) => {
                webRTCService.connectToPeer(selectedPeer.id, {
                    type: 'text',
                    content: text,
                    sender: { ...myDevice, id: socketService.getSocket()?.id }
                });
                toast.success(`Sent to ${getShortName(selectedPeer)}`);
            });
        } else {
            // Broadcast to room
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

    if (mode === 'menu') {
        return (
            <div className="w-full max-w-sm mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-500/20 shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]">
                        <Users size={32} className="text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Community Rooms</h2>
                    <p className="text-slate-400 text-xs px-4 leading-relaxed">
                        Join a private secure room to share files with a specific group.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setMode('create')}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all group active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={20} className="text-blue-400" />
                        </div>
                        <span className="font-semibold text-sm text-slate-200 group-hover:text-white">Create Room</span>
                    </button>
                    <button
                        onClick={() => setMode('join')}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl transition-all group active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Key size={20} className="text-emerald-400" />
                        </div>
                        <span className="font-semibold text-sm text-slate-200 group-hover:text-white">Join Room</span>
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'create') {
        return (
            <div className="w-full max-w-md mx-auto duration-500 pt-10">
                <button onClick={() => setMode('menu')} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm font-medium transition-colors">
                    ← Back to Menu
                </button>
                <div className="space-y-4 bg-slate-900/40 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white">Create New Room</h3>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Room Name</label>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="My Awesome Room"
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-base"
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={handleCreateRoom}
                        disabled={!roomName.trim() || isBusy}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                    >
                        {isBusy ? "Creating..." : <>Generate Room <ArrowRight size={18} /></>}
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'join') {
        return (
            <div className="w-full max-w-md mx-auto duration-500 pt-10">
                <button onClick={() => setMode('menu')} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm font-medium transition-colors">
                    ← Back to Menu
                </button>
                <div className="space-y-4 bg-slate-900/40 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white">Join Existing Room</h3>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Room Passcode</label>
                        <input
                            type="text"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                            placeholder="A1B2C3"
                            maxLength={6}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono text-center tracking-widest text-xl uppercase"
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={handleJoinRoom}
                        disabled={passcode.length < 6 || isBusy}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                    >
                        {isBusy ? "Joining..." : <>Enter Room <ArrowRight size={18} /></>}
                    </button>
                </div>
            </div>
        );
    }

    // Active Room View
    return (
        <div className="w-full h-full flex flex-col">
            {/* Room Header - Centered premium design */}
            <div className="w-full max-w-lg mx-auto px-4 py-4 text-center space-y-3">
                {/* Room Info */}
                <div className="inline-flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                        <Users size={22} className="text-blue-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">{activeRoomInfo?.name}</h2>
                </div>

                {/* Room Code with Copy */}
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(activeRoomInfo?.passcode);
                            toast.success('Room code copied!');
                        }}
                        className="inline-flex items-center gap-2 font-mono text-sm font-bold text-blue-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800 transition-all active:scale-95"
                    >
                        {activeRoomInfo?.passcode}
                        <Copy size={14} className="text-slate-400" />
                    </button>

                    {/* User Count Badge */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUsers(!showUsers)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all active:scale-95 ${peers.length > 0
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                                }`}
                        >
                            <Users size={14} />
                            {peers.length}
                        </button>

                        {/* Users Popover */}
                        {showUsers && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-slate-800/95 backdrop-blur-sm rounded-xl border border-slate-700/50 p-3 animate-in fade-in zoom-in-95 duration-200 z-50 shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-300">In Room</span>
                                    <button onClick={() => setShowUsers(false)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-700/50">
                                        <X size={12} />
                                    </button>
                                </div>
                                <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                                    {peers.length === 0 ? (
                                        <li className="text-xs text-slate-500 px-2 py-1.5">No one else yet</li>
                                    ) : (
                                        peers.map((peer) => (
                                            <li key={peer.id} className="flex items-center gap-2 text-xs text-slate-300 px-2 py-1.5 rounded-lg hover:bg-slate-700/50">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                                {getShortName(peer)}
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                        onClick={() => setTextModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 hover:bg-slate-800/60 text-white rounded-xl text-sm font-semibold transition-all border border-slate-700/50 hover:border-blue-500/30 active:scale-95"
                    >
                        <MessageSquare size={15} className="text-blue-400" />
                        <span>Broadcast</span>
                    </button>
                    <button
                        onClick={handleBroadcastFile}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 hover:bg-slate-800/60 text-white rounded-xl text-sm font-semibold transition-all border border-slate-700/50 hover:border-emerald-500/30 active:scale-95"
                    >
                        <FileText size={15} className="text-emerald-400" />
                        <span>Send File</span>
                    </button>
                    <button
                        onClick={handleLeave}
                        className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-semibold transition-all border border-red-500/20 active:scale-95"
                        title="Leave Room"
                    >
                        <LogOut size={15} />
                    </button>
                </div>

                {/* Waiting State - Always show */}
                <div className="pt-4 pb-4 animate-in fade-in duration-500">
                    <div className="flex flex-col items-center gap-4">
                        {/* Pulsing radar effect */}
                        <div className="relative">
                            <div className="absolute inset-0 w-16 h-16 bg-blue-500/20 rounded-full animate-ping" />
                            <div className="absolute inset-2 w-12 h-12 bg-blue-500/10 rounded-full animate-pulse" />
                            <div className="relative w-16 h-16 bg-slate-800/60 rounded-full flex items-center justify-center border border-slate-700/50">
                                <Users size={24} className="text-slate-400" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <p className="text-slate-400 text-sm">Waiting for others to join...</p>
                            <button
                                onClick={() => setShowTips(!showTips)}
                                className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800/50 rounded-lg transition-all"
                                title="Room Info"
                            >
                                <Info size={16} />
                            </button>
                        </div>

                        {/* Info Popover */}
                        {showTips && (
                            <div className="w-full max-w-xs bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Room Tips</span>
                                    <button onClick={() => setShowTips(false)} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                                <ul className="space-y-2 text-xs text-slate-400">
                                    <li className="flex items-start gap-2">
                                        <Copy size={12} className="text-blue-400 mt-0.5 shrink-0" />
                                        Share the room code with others
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Shield size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                                        All transfers are end-to-end encrypted
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Info size={12} className="text-amber-400 mt-0.5 shrink-0" />
                                        Don't close this tab to keep room active
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Peer Grid when peers exist */}
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
