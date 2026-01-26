import React, { useState, useEffect } from 'react';
import { File, ExternalLink, RefreshCw, Archive, Lock, Calendar, HardDrive } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/api.service';
import SimpleTable from '../UI/SimpleTable';
import { cn } from '../../utils/cn';

const UploadedFilesList = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const data = await apiService.listUserFiles();
            setFiles(data);
        } catch (error) {
            console.error("Failed to fetch files:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const copyLink = (fileId) => {
        const link = `${window.location.origin}/download/${fileId}`;
        navigator.clipboard.writeText(link);
        toast.success("Download link copied!");
    };

    const emptyState = (
        <tr>
            <td colSpan="4" className="p-12 text-center text-text-muted">
                <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                    <Archive size={48} strokeWidth={1} />
                    <p className="text-sm">No uploaded files yet</p>
                </div>
            </td>
        </tr>
    );

    const headers = [
        { label: 'File', className: 'pl-6' },
        { label: 'Size', className: 'hidden sm:table-cell' },
        { label: 'Date', className: 'hidden md:table-cell' },
        { label: 'Link', className: 'pr-6 text-right' }
    ];

    if (loading) {
        return (
            <div className="w-full h-40 flex items-center justify-center">
                <RefreshCw className="animate-spin text-primary" />
            </div>
        );
    }

    // Removed the "return null" for empty files to show the empty table state instead, which is better UI

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-4 px-1">
                <Archive size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Cloud Storage
                </h3>
            </div>

            <SimpleTable
                headers={headers}
                emptyState={emptyState}
                className="bg-black/20 border-white/5"
            >
                {files.length > 0 ? files.map((file) => (
                    <tr key={file.fileId} className="group hover:bg-white/5 transition-colors">
                        <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center border",
                                        file.encrypted
                                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                            : "text-blue-400 border-blue-500/20"
                                    )}
                                    style={!file.encrypted ? { background: 'rgb(15, 82, 186, 0.4)' } : undefined}
                                >
                                    {file.encrypted ? <Lock size={14} /> : <File size={14} />}
                                </div>
                                <span className="text-sm font-medium text-white truncate max-w-[120px] sm:max-w-[200px]" title={file.name}>
                                    {file.name}
                                </span>
                            </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                            <span className="text-xs text-text-muted flex items-center gap-1.5">
                                <HardDrive size={12} />
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                            <span className="text-xs text-text-muted font-mono bg-surface/5 px-2 py-1 rounded flex items-center gap-1.5 w-fit">
                                <Calendar size={12} />
                                {new Date(file.createdAt).toLocaleDateString()}
                            </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                            <button
                                onClick={() => copyLink(file.fileId)}
                                className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all active:scale-95 border border-transparent hover:border-white/10"
                                title="Copy Download Link"
                            >
                                <ExternalLink size={16} />
                            </button>
                        </td>
                    </tr>
                )) : null}
            </SimpleTable>
        </div>
    );
};

export default UploadedFilesList;
