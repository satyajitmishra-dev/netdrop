import React, { useState, useEffect, lazy, Suspense } from 'react';
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
import IncomingRequestModal from './components/Transfer/IncomingRequestModal';
import Banner from './components/UI/Banner';
import { useSound } from './hooks/useSound';
import Navigation from './components/Navigation/Navigation';

// Lazy-loaded components (reduce initial bundle size)
const ParticlesBackground = lazy(() => import('./components/UI/ParticlesBackground'));
const WelcomeModal = lazy(() => import('./components/UI/WelcomeModal'));
const TextShareModal = lazy(() => import('./components/Transfer/TextShareModal'));
const PairDeviceModal = lazy(() => import('./components/Transfer/PairDeviceModal'));
const ProfileModal = lazy(() => import('./components/Auth/ProfileModal'));
const SecureDownload = lazy(() => import('./pages/SecureDownload'));

// Lazy-loaded pages
const PairDropAlternative = lazy(() => import('./pages/PairDropAlternative'));
const SnapDropAlternative = lazy(() => import('./pages/SnapDropAlternative'));
const AirDropForWindows = lazy(() => import('./pages/AirDropForWindows'));
const NotFound = lazy(() => import('./pages/NotFound'));
const HistoryView = lazy(() => import('./components/History/HistoryView'));
const RoomManager = lazy(() => import('./components/Rooms/RoomManager'));

function App() {
  const dispatch = useDispatch();
  const { addToHistory, isEnabled: isHistoryEnabled } = useHistory();
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
  const { name: deviceName, type: deviceType, browser: deviceBrowser, network: deviceNetwork, renameDevice } = useDeviceIdentity();
  useRealtimePresence({ name: deviceName, type: deviceType, browser: deviceBrowser, network: deviceNetwork });
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

  // Restore Room Session if exists
  useEffect(() => {
    const savedRoom = sessionStorage.getItem('netdrop_room_session');
    if (savedRoom) {
      dispatch(setActiveTab('room'));
    }
  }, [dispatch]);

  // Track if we should auto-download the incoming file
  const autoDownloadRef = React.useRef(true); // Default to true (safe default)

  const isDownloadPage = currentPath.startsWith('/download/');
  const isPairDropAlt = currentPath === '/pairdrop-alternative';
  const isSnapDropAlt = currentPath === '/snapdrop-alternative';
  const isAirDropWin = currentPath === '/airdrop-for-windows';
  const isLandingPage = isPairDropAlt || isSnapDropAlt || isAirDropWin;
  const isNotFound = !isDownloadPage && !isLandingPage && currentPath !== '/' && currentPath !== '';

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

      // Process files sequentially
      const processFiles = async () => {
        for (const [index, file] of files.entries()) {
          const SIZE_LIMIT = 2 * 1024 * 1024 * 1024; // 2 GB
          if (file.size > SIZE_LIMIT) {
            // ... (existing size warning toast) ...
          }

          if (webRTCRef.current) {
            webRTCRef.current.onSendProgress = (status) => {
              if (status.type === 'complete') {
                toast.success('Sent Successfully', { id: `send-${file.name}` });
                playSuccess();
                addToHistory({
                  type: 'send',
                  category: 'file',
                  name: file.name,
                  size: file.size,
                  peer: getShortName(peer)
                });
              } else if (status.type === 'rejected') {
                toast.error('Transfer Failed/Declined', { id: `send-${file.name}` });
                playError();
              }
            };

            // Stagger sends if multiple
            if (index > 0) await new Promise(r => setTimeout(r, 500));

            try {
              // Connect and wait for data channel open
              await toast.promise(
                webRTCRef.current.connectToPeer(peer.id, file, {
                  senderEmail: user?.email,
                  sender: { name: deviceName, type: deviceType }
                }),
                {
                  loading: `Connecting to ${getShortName(peer)}...`,
                  success: `Connected! Sending ${file.name}...`,
                  error: (err) => err.message || 'Connection Failed'
                },
                { id: `conn-${file.name}` }
              );

              // Note: Actual upload progress is handled by onSendProgress via DataChannel events
              // connectToPeer resolving just means we started sending.
            } catch (err) {
              console.error("File send connection error:", err);
              // playError() is handled by toast.promise error
            }
          }
        }
      };

      processFiles();
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

  const handleSendText = async (text) => {
    if (textModal.peer && webRTCRef.current) {
      try {
        await toast.promise(
          webRTCRef.current.connectToPeer(textModal.peer.id, {
            type: 'text',
            content: text,
            sender: { name: deviceName, type: deviceType, id: socketService.getSocket()?.id }
          }),
          {
            loading: 'Sending...',
            success: `Sent to ${getShortName(textModal.peer)}`,
            error: (err) => err.message || 'Transmission Failed'
          }
        );

        // Add to History (Only if success)
        addToHistory({
          type: 'send',
          category: 'text',
          name: text,
          peer: getShortName(textModal.peer)
        });

        setTextModal({ ...textModal, isOpen: false });
      } catch (err) {
        console.error("Text send failed:", err);
      }
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
      // Process files sequentially
      for (const [index, file] of files.entries()) {
        const SIZE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB
        if (file.size > SIZE_LIMIT) {
          toast.error(`File ${file.name} exceeds 2GB limit`, { duration: 5000 });
          continue;
        }

        if (webRTCRef.current) {
          webRTCRef.current.onSendProgress = (status) => {
            if (status.type === 'complete') {
              toast.success('Sent Successfully', { id: `drop-${file.name}` });
              playSuccess();
              addToHistory({
                type: 'send',
                category: 'file',
                name: file.name,
                size: file.size,
                peer: getShortName(peer)
              });
            } else if (status.type === 'rejected') {
              toast.error('Transfer Failed', { id: `drop-${file.name}` });
              playError();
            }
          };

          if (index > 0) await new Promise(r => setTimeout(r, 500));

          try {
            await toast.promise(
              webRTCRef.current.connectToPeer(peer.id, file, {
                senderEmail: user?.email,
                sender: { name: deviceName, type: deviceType }
              }),
              {
                loading: `Connecting...`,
                success: `Connected! Sending ${file.name}...`,
                error: (err) => err.message || 'Connection Failed'
              },
              { id: `conn-drop-${file.name}` }
            );
          } catch (err) {
            console.error("Drop connect failed:", err);
          }
        }
      }

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

  const [showProfileModal, setShowProfileModal] = useState(false);

  // ... (existing code)

  /* ... */

  return (
    <div className="min-h-screen w-full flex flex-col items-center overflow-x-hidden selection:bg-primary/30">
      <Banner />
      <Suspense fallback={null}>
        <WelcomeModal />
      </Suspense>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{
        style: {
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '12px 20px',
        },
      }} />

      <Suspense fallback={null}>
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

        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
          onLogout={handleLogout}
        />
      </Suspense>

      <IncomingRequestModal
        isOpen={incomingRequest.isOpen}
        request={incomingRequest.request}
        onClose={() => {
          setIncomingRequest({ isOpen: false, request: null });
        }}
        onAccept={(shouldDownload) => {
          autoDownloadRef.current = shouldDownload;
          webRTCRef.current.acceptFileTransfer();
          setIncomingRequest({ isOpen: false, request: null });
        }}
        onDecline={() => {
          webRTCRef.current.rejectFileTransfer();
          setIncomingRequest({ isOpen: false, request: null });

          if (!isHistoryEnabled) {
            toast('File NOT saved. History is off.', {
              icon: '⚠️',
              style: {
                background: '#334155', // Slate-700
                color: '#fff',
              }
            });
          }
        }}
      />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Suspense fallback={null}>
          <ParticlesBackground />
        </Suspense>
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
        onProfileClick={() => setShowProfileModal(true)}
      />

      {/* Landing Pages (no nav/modals) */}
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        {isPairDropAlt && <PairDropAlternative />}
        {isSnapDropAlt && <SnapDropAlternative />}
        {isAirDropWin && <AirDropForWindows />}
      </Suspense>

      <main className={`relative z-10 flex-1 w-full flex flex-col pb-20 md:pb-0 safe-bottom isolate transition-all duration-300 overflow-hidden ${isLandingPage ? 'hidden' : ''}`}>
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
                myDeviceBrowser={deviceBrowser}
                myDeviceNetwork={deviceNetwork}
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
              <Suspense fallback={<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />}>
                <RoomManager onPeerSelect={handlePeerSelect} />
              </Suspense>
            </div>
            <Footer />
          </div>
        ) : activeTab === 'history' ? (
          <div className="w-full flex-1 flex flex-col items-center justify-between duration-500">
            <div className="flex-1 w-full px-4 pt-4">
              <Suspense fallback={<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />}>
                <HistoryView />
              </Suspense>
            </div>
            <Footer />
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center justify-between duration-500">
            <div className="flex-1 flex items-center justify-center w-full px-4">
              {isAuthenticated ? (
                <div className="max-w-lg w-full space-y-6">
                  {/* Removed Inline User Info here */}
                  <RemoteUpload />
                  {/* Removed UploadedFilesList here */}
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
