import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import { Shield, Link as LinkIcon } from 'lucide-react';
import { setActiveTab } from './store/slices/transfer.slice';
import { logout } from './store/slices/auth.slice';
import { socketService } from './services/socket.service';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebase.config';
import { processDropItems, zipFileList } from './utils/folder';

// Hooks
import { useAuthSession } from './hooks/useAuthSession';
import { useDeviceIdentity } from './hooks/useDeviceIdentity';
import { useRealtimePresence } from './hooks/useRealtimePresence';
import { useWebRTC } from './hooks/useWebRTC';
import { useHistory } from './context/HistoryContext';

import { getShortName } from './utils/device';

import DiscoveryGrid from './components/Transfer/DiscoveryGrid';
import RemoteUpload from './components/Remote/RemoteUpload';
import Footer from './components/Common/Footer';
import Login from './components/Auth/Login';
import SecureDownload from './pages/SecureDownload';
import HistoryView from './components/History/HistoryView';
import IncomingRequestModal from './components/Transfer/IncomingRequestModal';
import ParticlesBackground from './components/UI/ParticlesBackground';
import Banner from './components/UI/Banner';
import { useSound } from './hooks/useSound';
import TextShareModal from './components/Transfer/TextShareModal';
import Navigation from './components/Navigation/Navigation';
import PairDeviceModal from './components/Transfer/PairDeviceModal';
import RoomManager from './components/Rooms/RoomManager';
import NotFound from './pages/NotFound';

function App() {
  const dispatch = useDispatch();
  const { addToHistory } = useHistory();
  const { playSuccess, playError, playPop } = useSound();
  const { activeTab, peers } = useSelector((state) => state.transfer);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Incoming Request State
  const [incomingRequest, setIncomingRequest] = useState({
    isOpen: false,
    request: null
  });

  // Custom Hooks
  useAuthSession();
  const { name: deviceName, type: deviceType, renameDevice } = useDeviceIdentity();
  useRealtimePresence({ name: deviceName, type: deviceType });
  const { webRTCRef } = useWebRTC();

  // Local State
  const [isEditingName, setIsEditingName] = useState(false);

  // Routing State
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Track if we should auto-download the incoming file
  const autoDownloadRef = React.useRef(true); // Default to true (safe default)

  const isDownloadPage = currentPath.startsWith('/download/');
  const isNotFound = !isDownloadPage && currentPath !== '/' && currentPath !== '';

  const [textModal, setTextModal] = useState({
    isOpen: false,
    mode: 'send', // 'send' | 'receive'
    peer: null,
    text: ''
  });

  // State for Remote pairing modal
  const [showPairModal, setShowPairModal] = useState(false);

  // When Remote tab is clicked, open modal and immediately switch back to local view
  useEffect(() => {
    if (activeTab === 'remote') {
      setShowPairModal(true);
      // Switch back to local so the discovery grid stays visible behind the modal
      dispatch(setActiveTab('local'));
    }
  }, [activeTab, dispatch]);

  if (isNotFound) {
    return <NotFound />;
  }

  // Setup WebRTC Listeners (Using Context)
  useEffect(() => {
    if (webRTCRef.current) {
      webRTCRef.current.onDataReceived = (data, dataPeerId) => {
        if (data.type === 'file-request') {
          const senderInfo = data.sender || { name: 'Unknown Device' };
          const senderEmail = data.meta?.senderEmail;

          // Auto-Accept for Trusted (Same Email)
          if (isAuthenticated && user?.email && senderEmail === user.email) {
            toast.success(`Auto-accepted from your device: ${getShortName(senderInfo)}`);
            autoDownloadRef.current = true; // Trusted devices auto-download
            webRTCRef.current.acceptFileTransfer();
            return;
          }

          // Otherwise, show popup
          setIncomingRequest({
            isOpen: true,
            request: { ...data, sender: senderInfo }
          });
        }
        else if (data.type === 'text') {
          const senderInfo = data.sender || { name: 'Unknown Device', type: 'desktop' };
          setTextModal({
            isOpen: true,
            mode: 'receive',
            peer: senderInfo,
            text: data.content
          });

          // Add to History
          addToHistory({
            type: 'receive',
            category: 'text',
            name: data.content,
            peer: getShortName(senderInfo)
          });
        }
        else if (data.type === 'clipboard') {
          const senderInfo = data.sender || { name: 'Device' };

          // 1. Try to auto-write to clipboard (best effort)
          navigator.clipboard.writeText(data.content)
            .then(() => toast.success(`Clipboard synced from ${getShortName(senderInfo)}!`))
            .catch(() => { }); // Ignore error, modal will handle it

          // 2. Show the Modal (User requested "show like text share model")
          setTextModal({
            isOpen: true,
            mode: 'receive',
            peer: senderInfo,
            text: data.content
          });
          playSuccess(); // Sound


          // Add to History
          addToHistory({
            type: 'receive',
            category: 'clipboard',
            name: data.content,
            peer: getShortName(senderInfo)
          });
        }
        else if (data.type === 'file-complete') {
          playSuccess(); // Sound

          // Add to History first (Always saved)
          addToHistory({
            type: 'receive',
            category: 'file',
            name: data.meta.name,
            size: data.meta.size,
            peer: getShortName(data.peer || { name: 'Unknown' }),
            blob: data.file
          });

          // Check decision made at 'Accept' time
          if (autoDownloadRef.current) {
            // Auto-Download immediately
            const url = URL.createObjectURL(data.file);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = data.meta.name;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 100);

            toast.success(`Downloaded ${data.meta.name}`);
          } else {
            // Just notify it's in history
            toast.success(`Saved to History (Expires in 3m)`);
          }
        }
      };
    }
  }, [webRTCRef, isAuthenticated, user]); // Added dependencies for auto-accept check


  /* Interaction Handlers */

  const handlePeerSelect = (peer) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true; // Allow multiple

    input.onchange = async (e) => {
      let files = Array.from(e.target.files);
      if (files.length === 0) return;

      // Group multiple files into one zip
      if (files.length > 1) {
        const toastId = toast.loading(`Zipping ${files.length} files...`, { id: 'zipping' });
        try {
          const zipFile = await zipFileList(files);
          files = [zipFile];
          toast.dismiss(toastId);
        } catch (err) {
          console.error("Zipping failed:", err);
          toast.error("Failed to zip files");
          playError();
          return;
        }
      }

      files.forEach((file) => {
        const SIZE_LIMIT = 2 * 1024 * 1024 * 1024; // 2 GB
        if (file.size > SIZE_LIMIT) {
          toast((t) => (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-orange-400 flex items-center gap-2">
                <Shield size={16} /> Large File
              </span>
              <p className="text-sm">
                For files over 2GB, make sure you are on a stable Wi-Fi connection.
              </p>
              <div className="flex gap-2 mt-1">
                <button className="bg-slate-700 text-white px-3 py-1 rounded text-sm"
                  onClick={() => toast.dismiss(t.id)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ), { duration: 4000 });
        }

        if (webRTCRef.current) {
          webRTCRef.current.onSendProgress = (status) => {
            if (status.type === 'complete') {
              toast.success('Sent Successfully', { id: 'handshake' });
              playSuccess();

              // Add to History
              addToHistory({
                type: 'send',
                category: 'file',
                name: file.name,
                size: file.size,
                peer: getShortName(peer)
              });
            } else if (status.type === 'rejected') {
              // Ensure we dismiss the loading toast if rejected/failed
              toast.error('Transfer Declined/Failed', { id: 'handshake' });
              playError();
            }
          };
          // Pass sender email for trusted check
          webRTCRef.current.connectToPeer(peer.id, file, {
            senderEmail: user?.email
          });
          toast.loading(`Sending ${file.name} to ${getShortName(peer)}...`, { id: 'handshake' });
        }
      });
    };
    input.click();
  };

  /* Peer Menu State */


  /* ------------------- */

  const handleRightClickPeer = (peer) => {
    setTextModal({
      isOpen: true,
      mode: 'send',
      peer: peer,
      text: ''
    });
  };

  const handleSendClipboard = async (peer) => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast.error("Clipboard is empty");
        return;
      }

      if (webRTCRef.current) {
        webRTCRef.current.connectToPeer(peer.id, {
          type: 'clipboard',
          content: text,
          sender: { name: deviceName, type: deviceType, id: socketService.getSocket()?.id }
        });
        toast.success(`Clipboard sent to ${getShortName(peer)}`);

        // Add to History
        addToHistory({
          type: 'send',
          category: 'clipboard',
          name: text,
          peer: getShortName(peer)
        });
      }
    } catch (err) {
      console.error("Clipboard read failed:", err);
      toast.error("Failed to read clipboard. Check permissions.");
    }
  };

  const openTextModal = (peer) => {
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
        sender: { name: deviceName, type: deviceType, id: socketService.getSocket()?.id }
      });
      toast.success(`Sent to ${getShortName(textModal.peer)}`);

      // Add to History
      addToHistory({
        type: 'send',
        category: 'text',
        name: text,
        peer: getShortName(textModal.peer)
      });

      setTextModal({ ...textModal, isOpen: false });
    }
  };

  const handlePeerDrop = async (peer, items) => {
    if (!items || items.length === 0) return;

    const toastId = toast.loading("Processing dropped items...", { id: 'drop-process' });

    try {
      let files = await processDropItems(items);
      toast.dismiss(toastId);

      if (files.length === 0) {
        toast.error("No valid files or folders found");
        return;
      }

      // Group multiple files/folders into one zip
      if (files.length > 1) {
        const zipId = toast.loading(`Zipping ${files.length} items...`);
        try {
          const zipFile = await zipFileList(files);
          files = [zipFile];
          toast.dismiss(zipId);
        } catch (e) {
          toast.error("Failed to zip items");
          return;
        }
      }

      // Send each file
      files.forEach((file, index) => {
        // Check size limit again if needed, or rely on internal warnings
        const SIZE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB
        if (file.size > SIZE_LIMIT) {
          toast.error(`File ${file.name} exceeds 2GB limit`, { duration: 5000 });
          return; // Skip large file
        }

        if (webRTCRef.current) {
          // Stagger sends slightly to avoid congestion logic if sending many small files
          setTimeout(() => {
            webRTCRef.current.connectToPeer(peer.id, file, {
              senderEmail: user?.email
            });
            toast.loading(`Sending ${file.name}...`, { id: `send-${file.name}` });
          }, index * 500);
        }
      });

      // toast.success(`Prepared ${files.length} items for transfer!`);

    } catch (error) {
      console.error("Drop processing error:", error);
      toast.error("Failed to process dropped items");
      toast.dismiss(toastId);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      dispatch(setActiveTab('local'));
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
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
    <div className="min-h-screen w-full flex flex-col items-center bg-slate-950 overflow-x-hidden text-slate-200 font-sans selection:bg-blue-500/30">
      <Banner />
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
        peerName={getShortName(textModal.peer || {})}
        initialText={textModal.text}
        onSend={handleSendText}
        onSendClipboard={() => handleSendClipboard(textModal.peer)}
      />

      <PairDeviceModal
        isOpen={showPairModal}
        onClose={() => setShowPairModal(false)}
      />

      <IncomingRequestModal
        isOpen={incomingRequest.isOpen}
        request={incomingRequest.request}
        onClose={() => {
          // Closing via overlay click = Decline/Close? Let's assume close = save to history if not explicit
          // Or just do nothing? Actually better to enforce choice.
          // If they close, let's treat as decline for safety or do nothing.
          // But modal prevents interaction.
          setIncomingRequest({ isOpen: false, request: null });
        }}
        onAccept={(shouldDownload) => {
          autoDownloadRef.current = shouldDownload; // Store user choice
          webRTCRef.current.acceptFileTransfer();
          setIncomingRequest({ isOpen: false, request: null });
        }}
        onDecline={() => {
          webRTCRef.current.rejectFileTransfer();
          setIncomingRequest({ isOpen: false, request: null });
        }}
      />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <ParticlesBackground />
      </div>

      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          playPop();
          dispatch(setActiveTab(tab));
        }}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />

      <main className="relative z-10 flex-1 w-full flex flex-col pb-20 md:pb-0 safe-bottom isolate transition-all duration-300 overflow-hidden">
        {activeTab === 'local' ? (
          <div className="w-full h-full flex flex-col items-center justify-center duration-500">
            <div className="w-full h-full max-w-[1600px] mx-auto relative px-4 flex items-center justify-center">
              <DiscoveryGrid
                peers={peers}
                onSelectPeer={handlePeerSelect}
                onRightClickPeer={handleRightClickPeer}
                onPeerDrop={handlePeerDrop}
                myDeviceName={deviceName}
                myDeviceType={deviceType}
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
        ) : activeTab === 'room' ? (
          <div className="w-full flex-1 flex flex-col items-center justify-between duration-500">
            <div className="flex-1 flex items-center justify-center w-full px-4">
              <RoomManager onPeerSelect={handlePeerSelect} />
            </div>
            <Footer />
          </div>
        ) : activeTab === 'history' ? (
          <div className="w-full flex-1 flex flex-col items-center justify-between duration-500">
            <div className="flex-1 w-full px-4 pt-4">
              <HistoryView />
            </div>
            <Footer />
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center justify-between duration-500">
            <div className="flex-1 flex items-center justify-center w-full px-4">
              {isAuthenticated ? (
                <div className="max-w-lg w-full space-y-6">
                  <div className="w-full flex items-center gap-3 bg-slate-900/30 backdrop-blur-sm p-3 rounded-xl border border-slate-700/30">
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
            <Footer />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
