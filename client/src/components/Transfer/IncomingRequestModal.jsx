import React from 'react';
import { File, X, Check, UploadCloud } from 'lucide-react';
import { getShortName } from '../../utils/device';
import Modal from '../UI/Modal';
import PremiumButton from '../UI/PremiumButton';

const IncomingRequestModal = ({ isOpen, onClose, request, onAccept }) => {
    if (!isOpen || !request) return null;

    const { meta, sender } = request;
    const senderName = getShortName(sender || { name: 'Unknown Device' });
    const fileSize = (meta.size / 1024 / 1024).toFixed(2);

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => onAccept(false)} // Treat X close as "Cancel/History"
            title="Incoming Transfer"
            showCloseButton={false} // We have custom actions
        >
            <div className="flex flex-col gap-6">

                {/* Header Visualization */}
                <div className="flex flex-col items-center justify-center -mt-2">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse-slow mb-3 border border-primary/20">
                        <UploadCloud size={32} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-text-muted">Request from</p>
                        <h3 className="text-xl font-bold text-white">{senderName}</h3>
                    </div>
                </div>

                {/* File Card */}
                <div className="bg-surface/10 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface/20 flex items-center justify-center text-text-muted">
                        <File size={26} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate" title={meta.name}>{meta.name}</h4>
                        <p className="text-xs text-text-muted">{fileSize} MB • {meta.type || 'Unknown Type'}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <PremiumButton
                        variant="secondary"
                        onClick={() => onAccept(false)}
                        className="flex-1"
                    >
                        <X size={18} className="mr-2" />
                        Cancel
                    </PremiumButton>

                    <PremiumButton
                        variant="primary"
                        onClick={() => onAccept(true)}
                        className="flex-[1.5]"
                    >
                        <Check size={18} className="mr-2" />
                        Download
                    </PremiumButton>
                </div>
            </div>
        </Modal>
    );
};

export default IncomingRequestModal;
