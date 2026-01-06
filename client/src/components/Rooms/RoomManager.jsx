import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Users, LogOut, MessageSquare, FileText, ArrowRight, Shield, Plus, Key } from 'lucide-react';
import { socketService } from '../../services/socket.service';
import DiscoveryGrid from '../Transfer/DiscoveryGrid';
import TextShareModal from '../Transfer/TextShareModal';
import { setActiveTab } from '../../store/slices/transfer.slice';

const RoomManager = ({ onPeerSelect }) => {
    const dispatch = useDispatch();
    const { peers, myDevice } = useSelector((state) => state.transfer);

    // Local State
    const [mode, setMode] = useState('menu'); // 'menu' | 'create' | 'join' | 'active'
    const [roomName, setRoomName] = useState('');
    const [passcode, setPasscode] = useState(''); // Input for join, Display for create
    const [activeRoomInfo, setActiveRoomInfo] = useState(null); // { name, passcode }

    // Broadcast Text State
    const [textModalOpen, setTextModalOpen] = useState(false);

    // Listen for incoming broadcast text
    useEffect(() => {
        const socket = socketService.getSocket();

        const handleBroadcastText = (data) => {
            toast((t) => (
                <div onClick={() => toast.dismiss(t.id)} className="cursor-pointer">
                    <p className="font-bold text-blue-400 text-xs mb-1">📢 BROADCAST from {data.sender?.name || 'Unknown'}</p>
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

        socketService.createRoom(name, (response) => {
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

        socketService.joinRoomByCode(code, (response) => {
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
        socketService.broadcastText(text, myDevice);
        toast.success("Message broadcasted to room!");
        setTextModalOpen(false);
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
            <div className="w-full max-w-md mx-auto space-y-8 duration-500 pt-10">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
                        <Users size={40} className="text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Community Rooms</h2>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                        Create or join a private room to share files with a specific group of people.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setMode('create')}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-2xl transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={24} className="text-blue-400" />
                        </div>
                        <span className="font-bold text-white">Create Room</span>
                    </button>
                    <button
                        onClick={() => setMode('join')}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-2xl transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Key size={24} className="text-emerald-400" />
                        </div>
                        <span className="font-bold text-white">Join Room</span>
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
                        disabled={!roomName.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                    >
                        Generate Room <ArrowRight size={18} />
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
                        disabled={passcode.length < 6}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                    >
                        Enter Room <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    // Active Room View
    return (
        <div className="w-full h-full flex flex-col pt-4">
            {/* Room Header */}
            <div className="w-full max-w-[1600px] mx-auto px-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 bg-blue-500/10 px-6 py-3 rounded-2xl border border-blue-500/20 w-full md:w-auto">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                        <Users size={20} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">Current Room</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-white font-bold text-lg leading-tight truncate">{activeRoomInfo?.name}</h2>
                            <span className="text-slate-400 text-xs font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 select-all" title="Share this code">
                                {activeRoomInfo?.passcode}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide mask-fade-right">
                    <button
                        onClick={() => setTextModalOpen(true)}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-slate-700 flex items-center gap-2 whitespace-nowrap active:scale-95"
                    >
                        <MessageSquare size={16} className="text-blue-400" />
                        <span>Msg</span>
                    </button>
                    <button
                        onClick={handleBroadcastFile}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-slate-700 flex items-center gap-2 whitespace-nowrap active:scale-95"
                    >
                        <FileText size={16} className="text-emerald-400" />
                        <span>File</span>
                    </button>
                    <button
                        onClick={handleLeave}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-red-500/20 flex items-center gap-2 whitespace-nowrap active:scale-95"
                    >
                        <LogOut size={16} />
                        Leave
                    </button>
                </div>
            </div>

            {/* Reuse Discovery Grid to show Room Peers */}
            <div className="flex-1 w-full overflow-hidden relative">
                <div className="absolute inset-0 overflow-y-auto pb-20 scrollbar-hide">
                    <div className="w-full max-w-[1600px] mx-auto px-4">
                        {peers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[40vh] text-slate-500 animate-in fade-in zoom-in-95 duration-500">
                                <Users size={48} className="mb-4 opacity-50" />
                                <p className="text-lg font-medium">Room is empty</p>
                                <p className="text-sm">Share code <strong>{activeRoomInfo?.passcode}</strong> to invite others.</p>
                            </div>
                        ) : (
                            <DiscoveryGrid
                                peers={peers}
                                onSelectPeer={(peer) => {
                                    // Default behavior in room is broadcast usually, but if user clicks specific peer, maybe direct?
                                    // For now let's just trigger direct send as standard
                                    if (onPeerSelect) onPeerSelect(peer);
                                }}
                                myDeviceName={myDevice?.name}
                                onRightClickPeer={() => { }}
                            />
                        )}
                    </div>
                </div>
            </div>

            <TextShareModal
                isOpen={textModalOpen}
                onClose={() => setTextModalOpen(false)}
                mode="send"
                peerName={`Everyone in ${activeRoomInfo?.name}`}
                onSend={handleBroadcastText}
            />
        </div>
    );
};

export default RoomManager;
