import React from 'react';
import { useHistory } from '../../context/HistoryContext';
import { ArrowDown, ArrowUp, File, Download, Trash2, Clock, FileText, Clipboard, Search } from 'lucide-react';
import SimpleTable from '../UI/SimpleTable';
import { cn } from '../../utils/cn';

const HistoryView = () => {
    const { history, clearHistory, downloadFile } = useHistory();
    const [searchTerm, setSearchTerm] = React.useState('');

    const formatTime = (ts) => {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getIcon = (category) => {
        switch (category) {
            case 'file': return <File size={16} />;
            case 'text': return <FileText size={16} />;
            case 'clipboard': return <Clipboard size={16} />;
            default: return <File size={16} />;
        }
    };

    const filteredHistory = history.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.peer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const headers = [
        { label: 'Type', className: 'pl-6' },
        'Content',
        'Peer',
        'Time',
        { label: 'Action', className: 'pr-6 text-right' }
    ];

    const emptyState = (
        <tr>
            <td colSpan="5" className="p-12 text-center text-text-muted">
                <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                    <Clock size={48} strokeWidth={1} />
                    <p className="text-sm">No activity found</p>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col h-full">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Recent Activity</h2>
                    <p className="text-text-muted text-sm mt-1">Track your file transfers and shared content</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-surface/5 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all w-full md:w-64 hover:bg-surface/10"
                        />
                    </div>

                    {history.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="text-xs font-semibold text-error/80 hover:text-error hover:bg-error/10 px-3 py-2 rounded-xl transition-all flex items-center gap-2 border border-transparent hover:border-error/20"
                        >
                            <Trash2 size={14} />
                            <span className="hidden sm:inline">Clear All</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Simple Table */}
            <SimpleTable
                headers={headers}
                emptyState={emptyState}
                className="bg-gradient-to-b from-surface/5 to-surface/2"
            >
                {filteredHistory.length > 0 ? filteredHistory.map((item) => (
                    <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                        <td className="p-4 pl-6">
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center border",
                                item.type === 'send'
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            )}>
                                {item.type === 'send' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded bg-surface/10 text-text-muted">
                                    {getIcon(item.category)}
                                </div>
                                <div className="flex flex-col max-w-[200px] md:max-w-xs">
                                    <span className="text-sm font-medium text-white truncate" title={item.name}>
                                        {item.name}
                                    </span>
                                    {item.size && (
                                        <span className="text-xs text-text-muted">
                                            {(item.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    )}
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className="text-sm text-text-muted group-hover:text-white transition-colors">
                                {item.peer}
                            </span>
                        </td>
                        <td className="p-4">
                            <span className="text-xs text-text-muted font-mono bg-surface/5 px-2 py-1 rounded">
                                {formatTime(item.timestamp)}
                            </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                            {item.category === 'file' && item.type === 'receive' && item.blob ? (
                                <button
                                    onClick={() => downloadFile(item.id)}
                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-95 border border-transparent hover:border-primary/20"
                                    title="Download Again"
                                >
                                    <Download size={18} />
                                </button>
                            ) : (
                                <span className="text-xs text-text-muted/40 italic">--</span>
                            )}
                        </td>
                    </tr>
                )) : null}
            </SimpleTable>
        </div>
    );
};

export default HistoryView;
