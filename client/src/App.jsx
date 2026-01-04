import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import { Shield, Zap, History, Smartphone, Monitor } from 'lucide-react';
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
  const { peers, activeTab, myDevice } = useSelector((state) => state.transfer);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isDownloadPage, setIsDownloadPage] = useState(false);

  const [textModal, setTextModal] = useState({
    isOpen: false,
    mode: 'send', // 'send' | 'receive'
    peer: null,
    text: ''
  });
  const [isEditingName, setIsEditingName] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      <TextShareModal
        isOpen={textModal.isOpen}
        onClose={() => setTextModal({ ...textModal, isOpen: false })}
        mode={textModal.mode}
        peerName={textModal.peer?.name || 'Unknown Device'}
        initialText={textModal.text}
        onSend={handleSendText}
      />

      {/* Background Ambience */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      <header className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            NetDrop
          </h1>
        </div>
        <nav className="flex gap-4">
          {['local', 'remote'].map((tab) => (
            <button
              key={tab}
              onClick={() => dispatch(setActiveTab(tab))}
              className={`text-sm px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2
                 ${activeTab === tab
                  ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'text-text-muted hover:text-white hover:bg-white/5'}`}
            >
              {tab === 'local' ? <Zap size={14} /> : <Shield size={14} />}
              {tab === 'local' ? 'Local Share' : 'Secure Cloud'}
            </button>
          ))}
          <button className="text-text-muted hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
            <History size={20} />
          </button>
        </nav>
      </header>

      <main className="w-full max-w-5xl z-10 flex flex-col items-center mt-20">
        {activeTab === 'local' ? (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="mb-8 text-center px-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">Nearby Devices</h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-text-muted">
                <div className="flex items-center gap-2">
                  {myDevice?.type === 'mobile' ? <Smartphone size={16} /> : <Monitor size={16} />}
                  <span className="text-sm flex items-center gap-2">Visible as:
                    {isEditingName ? (
                      <input
                        autoFocus
                        type="text"
                        className="bg-transparent border-b border-secondary text-secondary font-medium w-32 focus:outline-none text-center"
                        defaultValue={myDevice?.name}
                        onBlur={(e) => {
                          const newName = e.target.value.trim();
                          setIsEditingName(false);
                          if (newName && newName !== myDevice?.name) {
                            localStorage.setItem('netdrop_device_name', newName);
                            window.location.reload();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.target.blur();
                          }
                        }}
                      />
                    ) : (
                      <span
                        className="text-secondary font-medium cursor-pointer hover:bg-secondary/10 px-2 py-1 rounded transition-colors flex items-center gap-1 group relative"
                        onClick={() => setIsEditingName(true)}
                        title="Click to edit device name"
                      >
                        {myDevice?.name}
                        <span className="opacity-0 group-hover:opacity-50 text-[10px]">✎</span>
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative py-10 scale-125">
              <DiscoveryGrid
                peers={peers}
                onSelectPeer={handlePeerSelect}
                onRightClickPeer={handleRightClickPeer}
              />
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-500">
            {isAuthenticated ? (
              <div className="flex flex-col items-center w-full">
                {/* Show User Profile Snippet */}
                <div className="flex items-center gap-4 mb-8 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <img src={user?.photoURL} alt="Profile" className="w-12 h-12 rounded-full border-2 border-accent" />
                  <div className="text-left">
                    <h3 className="text-white font-bold">{user?.displayName}</h3>
                    <p className="text-text-muted text-xs">{user?.email}</p>
                  </div>
                </div>
                <RemoteUpload />
              </div>
            ) : (
              <Login />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
