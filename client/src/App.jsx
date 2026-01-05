import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import { Shield, Zap, History, Smartphone, Monitor, Link, Users, Info, LogOut, User as UserIcon, Lock } from 'lucide-react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase.config';
import { setUser, logout } from './store/slices/auth.slice';
import { socketService } from './services/socket.service';
import { discoveryService } from './services/discovery.service';
import { setMyDevice, setActiveTab } from './store/slices/transfer.slice';

import DiscoveryGrid from './components/Transfer/DiscoveryGrid';
import RemoteUpload from './components/Remote/RemoteUpload';
import SecureDownload from './pages/SecureDownload';
import Login from './components/Auth/Login';
import TextShareModal from './components/Transfer/TextShareModal';

function App() {
  const dispatch = useDispatch();
  const { activeTab, myDevice, peers } = useSelector((state) => state.transfer);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDownloadPage, setIsDownloadPage] = useState(false);

  // --- Session Management (3 Hour Limit + Token Refresh) ---
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Enforce 3-hour session limit
        const lastSignIn = new Date(currentUser.metadata.lastSignInTime).getTime();
        const now = Date.now();
        const threeHours = 3 * 60 * 60 * 1000;

        if (now - lastSignIn > threeHours) {
          await signOut(auth);
          dispatch(logout());
          toast.error("Session expired. Please log in again.");
          return;
        }

        // Refresh Redux State with new/current token
        const token = await currentUser.getIdToken();
        dispatch(setUser({
          user: {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          token
        }));
      } else {
        dispatch(logout());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
  };

  const [textModal, setTextModal] = useState({
    isOpen: false,
    mode: 'send', // 'send' | 'receive'
    peer: null,
    text: ''
  });


  useEffect(() => {
    // Check if we are on a download page
    if (window.location.pathname.startsWith('/download/')) {
      setIsDownloadPage(true);
      return;
    }

    // Smart Device Detection
    const detectDevice = () => {
      const ua = navigator.userAgent;
      let type = 'desktop';
      let defaultName = 'Device';

      if (/ipad|tablet/i.test(ua)) type = 'tablet';
      else if (/mobile/i.test(ua)) type = 'mobile';

      if (/windows/i.test(ua)) defaultName = 'Windows PC';
      else if (/macintosh|mac os x/i.test(ua)) defaultName = 'MacBook';
      else if (/android/i.test(ua)) defaultName = 'Android';
      else if (/iphone/i.test(ua)) defaultName = 'iPhone';
      else if (/linux/i.test(ua)) defaultName = 'Linux PC';

      return { type, defaultName: `${defaultName}-${Math.floor(Math.random() * 1000)}` };
    };

    const { type, defaultName } = detectDevice();

    // Use saved name or generated default
    let deviceName = localStorage.getItem('netdrop_device_name');
    if (!deviceName) {
      deviceName = defaultName;
      localStorage.setItem('netdrop_device_name', deviceName);
    }

    dispatch(setMyDevice({ name: deviceName, type }));

    // WebRTC Data Listener
    import('./services/webrtc.service').then(({ webRTCService }) => {
      webRTCService.onDataReceived = (data, dataPeerId) => {
        if (data.type === 'text') {
          // Robust Sender Name: Use payload sender OR fallback to ID
          const senderInfo = data.sender || { name: 'Unknown Device', type: 'desktop' };

          setTextModal({
            isOpen: true,
            mode: 'receive',
            peer: senderInfo,
            text: data.content
          });
          // Play notification sound if desired
        }
        else if (data.type === 'file-complete') {
          // ... (Keep existing file toast logic)
          toast((t) => (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <span className="font-bold flex items-center gap-2 text-emerald-400">
                <Shield size={16} /> File Received
              </span>
              <div className="text-sm">
                <p className="font-medium text-white">{data.meta.name}</p>
                <p className="text-xs text-text-muted">{(data.meta.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-secondary text-white px-3 py-1 rounded text-xs flex-1"
                  onClick={() => {
                    const url = URL.createObjectURL(data.file);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = data.meta.name;
                    document.body.appendChild(a);
                    a.click();
                    toast.dismiss(t.id);
                  }}>
                  Download
                </button>
                <button className="bg-slate-700 text-white px-3 py-1 rounded text-xs"
                  onClick={() => toast.dismiss(t.id)}>
                  Cancel
                </button>
              </div>
            </div>
          ), { duration: Infinity, position: 'top-right' });
        }
      };
    });

    // Socket & Discovery Init
    const socket = socketService.connect();

    const handleConnect = () => {
      // Only announce if visible
      if (!document.hidden) {
        discoveryService.init({ name: deviceName, type });
        toast.success("Connected to NetDrop Network", {
          id: 'netdrop-connect',
          style: { background: '#0f172a', color: '#fff', border: '1px solid #2563EB' }
        });
      }
    };

    // Visibility API for Presence
    const handleVisibilityChange = () => {
      if (document.hidden) {
        discoveryService.leave();
        console.log("🙈 App backgrounded - Hidden from discovery");
      } else {
        // Re-announce presence
        if (socket.connected) {
          discoveryService.init({ name: deviceName, type });
          console.log("👀 App active - Announced presence");
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (socket.connected) handleConnect();
    else socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      discoveryService.leave();
      socketService.disconnect();
    };
  }, [dispatch]);

  /* Advanced Interaction Handlers */

  // 1. Left Click: File Transfer
  const handlePeerSelect = (peer) => {
    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Advanced Logic: Auto-Cloud Switch for Large Files (>10MB)
      const SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB
      if (file.size > SIZE_LIMIT) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-bold text-orange-400 flex items-center gap-2">
              <Shield size={16} /> Large File Detected
            </span>
            <p className="text-sm">
              Files over 10MB are better sent via Secure Cloud to ensure stability.
            </p>
            <div className="flex gap-2 mt-1">
              <button
                className="bg-accent text-white px-3 py-1 rounded text-sm"
                onClick={() => {
                  toast.dismiss(t.id);
                  dispatch(setActiveTab('remote'));
                  // ideally pass file to remote component via redux or context
                }}
              >
                Switch to Cloud
              </button>
              <button
                className="bg-slate-700 text-white px-3 py-1 rounded text-sm"
                onClick={() => toast.dismiss(t.id)}
              >
                Cancel
              </button>
            </div>
          </div>
        ), { duration: 6000, style: { background: '#0f172a', color: '#fff', border: '1px solid #f97316' } });
        return;
      }

      // Normal WebRTC Transfer
      import('./services/webrtc.service').then(({ webRTCService }) => {
        webRTCService.onSendProgress = (status) => {
          if (status.type === 'complete') {
            toast.success('Sent Successfully', { id: 'handshake' });
          }
        };
        webRTCService.connectToPeer(peer.id, file);
      });
      toast.loading(`Sending ${file.name} to ${peer.name}...`, { id: 'handshake' });
    };
    input.click();
  };

  // 2. Right Click: Text Share
  const handleRightClickPeer = (peer) => {
    setTextModal({
      isOpen: true,
      mode: 'send',
      peer: peer,
      text: ''
    });
  };

  const handleSendText = (text) => {
    if (textModal.peer) {
      import('./services/webrtc.service').then(({ webRTCService }) => {
        webRTCService.connectToPeer(textModal.peer.id, {
          type: 'text',
          content: text,
          sender: myDevice // Pass my own device info
        });
        toast.success(`Sent to ${textModal.peer.name}`);
        setTextModal({ ...textModal, isOpen: false }); // Close modal after sending
      });
    }
  };

  if (isDownloadPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <Toaster position="bottom-center" />
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow" />
        </div>
        <SecureDownload />
      </div>
    );
  }

  // ... (Keep existing imports and state logic up to return)

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center bg-slate-950 overflow-hidden text-slate-200 font-sans selection:bg-blue-500/30">
      <Toaster position="top-center" reverseOrder={false} toastOptions={{
        style: {
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '12px 20px',
        },
      }} />

      <TextShareModal
        isOpen={textModal.isOpen}
        onClose={() => setTextModal({ ...textModal, isOpen: false })}
        mode={textModal.mode}
        peerName={textModal.peer?.name || 'Unknown Device'}
        initialText={textModal.text}
        onSend={handleSendText}
      />

      {/* --- Ambient Background (Single Blue Tone) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-800/5 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      {/* --- Mobile Header --- */}
      <header className="md:hidden absolute top-0 w-full p-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-blue-500 rounded-lg rotate-6 opacity-20" />
            <div className="absolute inset-0 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 z-10">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">NetDrop</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all" title="About">
            <Info size={18} />
          </button>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="relative">
              <img src={user?.photoURL} alt="User" className="w-8 h-8 rounded-full border border-blue-500/30" />
            </button>
          ) : (
            <button
              onClick={() => dispatch(setActiveTab('remote'))}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              title="Sign In"
            >
              <UserIcon size={18} />
            </button>
          )}
        </div>
      </header>

      {/* --- Header (Desktop) --- */}
      <header className="hidden md:flex absolute top-0 w-full p-6 justify-between items-center max-w-7xl mx-auto z-50">
        <div className="flex items-center gap-4 group cursor-default min-w-fit">
          <div className="relative w-11 h-11">
            <div className="absolute inset-0 bg-blue-500 rounded-xl rotate-6 opacity-20 group-hover:rotate-12 transition-transform duration-500" />
            <div className="absolute inset-0 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 z-10">
              <Zap className="w-6 h-6 text-white text-shadow-sm" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">NetDrop</h1>
            <p className="text-[10px] text-blue-300/80 font-bold uppercase tracking-[0.2em]">Secure Transfer</p>
          </div>
        </div>

        <nav className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-2xl mx-auto">
          {[
            { id: 'local', icon: Zap, label: 'Local Share' },
            { id: 'remote', icon: Link, label: 'Remote' },
            { id: 'room', icon: Users, label: 'Room' },
            { id: 'vault', icon: Lock, label: 'Vault' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={`relative px-4 lg:px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2.5
                 ${activeTab === tab.id
                  ? 'text-white shadow-lg bg-blue-600'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 min-w-fit justify-end">
          <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all transform active:scale-95" title="About">
            <Info size={20} />
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full pl-1 pr-4 py-1 transition-all cursor-default">
              <img src={user?.photoURL} alt="User" className="w-8 h-8 rounded-full border border-blue-500/30" />
              <button onClick={handleLogout} className="text-xs font-bold text-slate-300 hover:text-red-400 transition-colors uppercase tracking-wider flex items-center gap-1.5">
                Logout <LogOut size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => dispatch(setActiveTab('remote'))}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              title="Sign In"
            >
              <UserIcon size={20} />
            </button>
          )}
        </div>
      </header>


      {/* --- Main Content Area --- */}
      <main className="relative z-10 flex-1 w-full flex flex-col pt-20 md:pt-24 pb-20 md:pb-0 scrollbar-hide">
        {activeTab === 'local' ? (
          <div className="w-full h-full flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-full h-full max-w-[1600px] mx-auto relative">
              <DiscoveryGrid
                peers={peers}
                onSelectPeer={handlePeerSelect}
                onRightClickPeer={handleRightClickPeer}
                myDeviceName={myDevice?.name}
                isEditingName={isEditingName}
                onEditName={() => setIsEditingName(true)}
                onNameChange={(e) => {
                  const newName = e.target.value.trim();
                  setIsEditingName(false);
                  if (newName && newName !== myDevice?.name) {
                    localStorage.setItem('netdrop_device_name', newName);
                    window.location.reload();
                  }
                }}
              />
            </div>
          </div>
        ) : activeTab === 'remote' ? (
          <div className="w-full flex-1 flex flex-col items-center justify-start pt-16 md:pt-10 p-4 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-y-auto">
            <div className="w-full max-w-md mx-auto text-center space-y-4">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Link size={40} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Remote Link</h2>
              <p className="text-slate-400 max-w-md mx-auto">Connect and transfer files between valid devices over the internet.</p>
              <span className="inline-block px-3 py-1 bg-blue-900/30 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30">COMING SOON</span>
            </div>
          </div>
        ) : activeTab === 'room' ? (
          <div className="w-full flex-1 flex flex-col items-center justify-start pt-16 md:pt-10 p-4 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-y-auto">
            <div className="w-full max-w-md mx-auto text-center space-y-4">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Users size={40} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Community Rooms</h2>
              <p className="text-slate-400 max-w-md mx-auto">Join local network rooms to chat and share files with groups.</p>
              <span className="inline-block px-3 py-1 bg-blue-900/30 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30">COMING SOON</span>
            </div>
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center justify-start pt-12 md:pt-10 p-4 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-y-auto">
            {
              isAuthenticated ? (
                <div className="w-full max-w-xl flex flex-col items-center gap-8 mb-10" >
                  <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-md p-3 pr-6 rounded-full border border-white/10 shadow-xl">
                    <img src={user?.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-blue-500/50" />
                    <div className="text-left">
                      <h3 className="text-white font-bold text-sm leading-none mb-1">{user?.displayName}</h3>
                      <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">{user?.email}</p>
                    </div>
                  </div>
                  <RemoteUpload />
                </div>
              ) : (
                <Login />
              )
            }
          </div >
        )}
      </main >

      {/* --- Mobile Navigation (Bottom Bar) --- */}
      < nav className="md:hidden absolute bottom-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 pb-6 pt-3 px-2 flex justify-between items-center overflow-x-auto scrollbar-hide" >
        {
          [
            { id: 'local', icon: Zap, label: 'Local' },
            { id: 'remote', icon: Link, label: 'Remote' },
            { id: 'room', icon: Users, label: 'Room' },
            { id: 'vault', icon: Lock, label: 'Vault' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all duration-300 min-w-[70px]
                        ${activeTab === tab.id ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
              <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          ))
        }
      </nav >

    </div >
  );
}

export default App;
