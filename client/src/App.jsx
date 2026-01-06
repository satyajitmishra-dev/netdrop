import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import { Shield } from 'lucide-react';
import { setActiveTab } from './store/slices/transfer.slice';

// Hooks
import { useAuthSession } from './hooks/useAuthSession';
import { useDeviceIdentity } from './hooks/useDeviceIdentity';
import { useRealtimePresence } from './hooks/useRealtimePresence';
import { useWebRTC } from './hooks/useWebRTC';

import DiscoveryGrid from './components/Transfer/DiscoveryGrid';
import RemoteUpload from './components/Remote/RemoteUpload';
import PairingInterface from './components/Remote/PairingInterface';
import RoomManager from './components/Rooms/RoomManager';
import SecureDownload from './pages/SecureDownload';
import Login from './components/Auth/Login';
import TextShareModal from './components/Transfer/TextShareModal';
import Navigation from './components/Navigation/Navigation';

function App() {
  const dispatch = useDispatch();
  const { activeTab, peers } = useSelector((state) => state.transfer);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Custom Hooks
  useAuthSession();
  const { name: deviceName, type: deviceType, renameDevice } = useDeviceIdentity();
  useRealtimePresence({ name: deviceName, type: deviceType });
  const { webRTCRef } = useWebRTC();

  // Local State
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDownloadPage, setIsDownloadPage] = useState(false);

  const [textModal, setTextModal] = useState({
    isOpen: false,
    mode: 'send', // 'send' | 'receive'
    peer: null,
    text: ''
  });

  // Check Download Page Route
  useEffect(() => {
    // NOTE: Ideally use React Router <Routes> here if possible, keeping manual check for now to match current structure 
    // unless user gave explicit permission to wrap root in Router which might be in main.jsx
    if (window.location.pathname.startsWith('/download/')) {
      setIsDownloadPage(true);
    }
  }, []);


  // Setup WebRTC Listeners (Once service is loaded)
  useEffect(() => {
    // Poll or wait for Ref? Since import is fast, usually safe.
    // Better pattern: The hook could expose specific listeners, but for now we attach manually if ref exists.
    // We utilize the fact that we can attach to the *prototype* or service singleton if we imported it directly,
    // but here we want to use the specific instance we loaded. 
    // Actually, create a small interval or check to attach listener once.

    const interval = setInterval(() => {
      if (webRTCRef.current) {
        clearInterval(interval);

        webRTCRef.current.onDataReceived = (data, dataPeerId) => {
          if (data.type === 'text') {
            const senderInfo = data.sender || { name: 'Unknown Device', type: 'desktop' };
            setTextModal({
              isOpen: true,
              mode: 'receive',
              peer: senderInfo,
              text: data.content
            });
          }
          else if (data.type === 'file-complete') {
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
      }
    }, 500);

    return () => clearInterval(interval);
  }, [webRTCRef]);


  /* Interaction Handlers */

  const handlePeerSelect = (peer) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

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
                }}
              >
                Switch to Cloud
              </button>
              <button className="bg-slate-700 text-white px-3 py-1 rounded text-sm"
                onClick={() => toast.dismiss(t.id)}
              >
                Cancel
              </button>
            </div>
          </div>
        ), { duration: 6000, style: { background: '#0f172a', color: '#fff', border: '1px solid #f97316' } });
        return;
      }

      if (webRTCRef.current) {
        webRTCRef.current.onSendProgress = (status) => {
          if (status.type === 'complete') {
            toast.success('Sent Successfully', { id: 'handshake' });
          }
        };
        webRTCRef.current.connectToPeer(peer.id, file);
        toast.loading(`Sending ${file.name} to ${peer.name}...`, { id: 'handshake' });
      }
    };
    input.click();
  };

  const handleRightClickPeer = (peer) => {
    setTextModal({
      isOpen: true,
      mode: 'send',
      peer: peer,
      text: ''
    });
  };

  const handleSendText = (text) => {
    if (textModal.peer && webRTCRef.current) {
      webRTCRef.current.connectToPeer(textModal.peer.id, {
        type: 'text',
        content: text,
        sender: { name: deviceName, type: deviceType }
      });
      toast.success(`Sent to ${textModal.peer.name}`);
      setTextModal({ ...textModal, isOpen: false });
    }
  };

  const handleLogout = () => {
    // Logic handled in slice mostly, but we can add specific cleanup if needed
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
    <div className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center bg-slate-950 overflow-hidden text-slate-200 font-sans selection:bg-blue-500/30">
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

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-800/5 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => dispatch(setActiveTab(tab))}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />

      <main className="relative z-10 flex-1 w-full flex flex-col pt-20 md:pt-24 pb-20 md:pb-0 scrollbar-hide isolate transition-all duration-300">
        {activeTab === 'local' ? (
          <div className="w-full h-full flex items-center justify-center duration-500">
            <div className="w-full h-full max-w-[1600px] mx-auto relative">
              <DiscoveryGrid
                peers={peers}
                onSelectPeer={handlePeerSelect}
                onRightClickPeer={handleRightClickPeer}
                myDeviceName={deviceName}
                isEditingName={isEditingName}
                onEditName={() => setIsEditingName(true)}
                onNameChange={(e) => {
                  const newName = e.target.value.trim();
                  setIsEditingName(false);
                  if (newName && newName !== deviceName) {
                    renameDevice(newName);
                  }
                }}
              />
            </div>
          </div>
        ) : activeTab === 'remote' ? (
          <div className="w-full flex-1 flex flex-col items-center justify-start pt-16 md:pt-10 p-4 duration-500 overflow-y-auto">
            <PairingInterface
              onPairSuccess={(peer) => {
                setTimeout(() => dispatch(setActiveTab('local')), 1000);
              }}
            />
          </div>
        ) : activeTab === 'room' ? (
          <div className="w-full flex-1 flex flex-col items-center justify-start pt-16 md:pt-10 duration-500 overflow-y-auto scrollbar-hide">
            <RoomManager onPeerSelect={handlePeerSelect} />
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center pt-2 md:pt-6 px-4 pb-40 md:pb-10 duration-500 overflow-y-auto scrollbar-hide">
            {isAuthenticated ? (
              <div className="w-full max-w-lg space-y-6">
                <div className="flex items-center gap-3 bg-slate-900/30 backdrop-blur-sm p-3 rounded-xl border border-slate-700/30">
                  <img src={user?.photoURL} alt="Profile" className="w-9 h-9 rounded-full border border-blue-500/30" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{user?.displayName}</h3>
                    <p className="text-slate-400 text-xs truncate">{user?.email}</p>
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
