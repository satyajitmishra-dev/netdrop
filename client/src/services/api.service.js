// Production: Use Render backend. Development: Use localhost.
const PRODUCTION_API = "https://netdrop-server.onrender.com/api";
const API_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? PRODUCTION_API : "http://localhost:5004/api");

// Helper to get token from Redux store (via local storage or direct access if easier, 
// but for cleaner service architecture, we'll try to get it from the store instance if possible or localStorage)
// For MVP, we'll assume the token is stored in localStorage by the auth slice or component upon login
// OR we can access the store directly.
import { store } from "../store/store";

const getHeaders = () => {
    const state = store.getState();
    const token = state.auth.token;
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

const parseError = async (response) => {
    let message = `Request failed (${response.status})`;

    try {
        const data = await response.json();
        if (data?.error) message = data.error;
        else if (data?.message) message = data.message;
        else if (typeof data === "string") message = data;
    } catch {
        try {
            const text = await response.text();
            if (text) message = text;
        } catch {
            // Fallback to status-based message
        }
    }

    throw new Error(message);
};

export const apiService = {
    // Initialize upload session & get presigned URL
    initUpload: async (metadata) => {
        const response = await fetch(`${API_URL}/files/upload/init`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(metadata),
        });
        if (!response.ok) await parseError(response);
        return await response.json();
    },

    // Upload the actual encrypted blob to R2
    uploadFileToR2: async (uploadUrl, encryptedBlob) => {
        const response = await fetch(uploadUrl, {
            method: "PUT",
            body: encryptedBlob,
            headers: {
                "Content-Type": "application/octet-stream",
            },
        });
        if (!response.ok) {
            const message = `Upload failed (${response.status})`;
            throw new Error(message);
        }
        return true;
    },

    // Get download link
    getDownloadLink: async (fileId) => {
        const response = await fetch(`${API_URL}/files/download/${fileId}`);
        if (!response.ok) await parseError(response);
        return await response.json();
    },

    // List user files
    listUserFiles: async () => {
        const response = await fetch(`${API_URL}/files/list`, {
            headers: getHeaders()
        });
        if (!response.ok) await parseError(response);
        return await response.json();
    }
};
