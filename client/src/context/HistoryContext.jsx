import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const HistoryContext = createContext(null);

export const HistoryProvider = ({ children }) => {
    const [history, setHistory] = useState([]);

    /**
     * @param {Object} item
     * @param {string} item.type - 'send' | 'receive'
     * @param {string} item.category - 'file' | 'text' | 'clipboard'
     * @param {string} item.name - Filename or Text snippet
     * @param {number} item.size - File size in bytes (optional)
     * @param {string} item.peer - Peer Name
     * @param {Blob} [item.blob] - File Blob (for redownload)
     */
    const addToHistory = useCallback((item) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newItem = {
            id,
            timestamp: Date.now(),
            ...item
        };
        setHistory(prev => [newItem, ...prev]);

        // Expiry Logic for Files (180s)
        if (item.category === 'file' && item.blob) {
            setTimeout(() => {
                setHistory(prev => prev.map(h => {
                    if (h.id === id) {
                        return { ...h, blob: null, expired: true }; // Clear blob to free memory
                    }
                    return h;
                }));
            }, 180000); // 3 minutes
        }
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        toast.success("History cleared");
    }, []);

    const downloadFile = useCallback((id) => {
        const item = history.find(h => h.id === id);
        if (item && item.blob) {
            const url = URL.createObjectURL(item.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.name;
            a.click();
            URL.revokeObjectURL(url); // Revoke immediately after trigger
        } else {
            toast.error("File expired or unavailable");
        }
    }, [history]);

    return (
        <HistoryContext.Provider value={{ history, addToHistory, clearHistory, downloadFile }}>
            {children}
        </HistoryContext.Provider>
    );
};

export const useHistory = () => {
    const context = useContext(HistoryContext);
    if (!context) {
        throw new Error('useHistory must be used within a HistoryProvider');
    }
    return context;
};
