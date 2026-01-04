# NetDrop ⚡

**NetDrop** is a next-generation file sharing platform that combines **local peer-to-peer (WebRTC) transfer** with **secure encrypted cloud storage (Cloudflare R2)**. It provides a seamless "AirDrop-like" experience for local devices and an enterprise-grade secure link sharing system for remote users.

![NetDrop Landing](https://via.placeholder.com/1200x600?text=NetDrop+UI+Preview)

## 🚀 Key Features

*   **Local High-Speed Share**: Direct P2P transfer between devices on the same network using WebRTC. No size limits, no server bandwidth usage.
*   **Secure Cloud Storage**: Upload files to Cloudflare R2 with **Client-Side Encryption** (AES-GCM). The server never sees the plaintext file or the decryption key.
*   **Smart Discovery**: Automatically discovers devices on the same network (like AirDrop). Includes background presence management.
*   **Enterprise Security**:
    *   Zero-Knowledge Encryption.
    *   Firebase Authentication (Google Sign-In).
    *   User-defined passcodes for download links.
*   **Modern UI**: Built with React, TailwindCSS, and Framer Motion for a premium, glassmorphism aesthetic.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Redux Toolkit, TailwindCSS, Socket.io-client, WebRTC (Simple-Peer/Native).
*   **Backend**: Node.js, Express, Socket.io (Signaling), Cloudflare R2 (AWS SDK v3), MongoDB (Metadata), Firebase Admin (Auth).
*   **Security**: Web Crypto API (AES-GCM, PBKDF2), Helmet, CORS.

## 📦 Installation & Setup

### Prerequisites
*   Node.js v16+
*   MongoDB Instance
*   Cloudflare R2 Bucket
*   Firebase Project

### 1. Clone Repository
```bash
git clone https://github.com/your-username/netdrop.git
cd netdrop
```

### 2. Server Setup
```bash
cd server
npm install
```
Create a `.env` file in `server/`:
```env
PORT=5004
MONGO_URI=mongodb+srv://...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
FIREBASE_SERVICE_ACCOUNT={"type": "service_account", ...} (JSON String)
```
Start Server:
```bash
npm start
```

### 3. Client Setup
```bash
cd client
npm install
```
Create a `.env` file in `client/`:
```env
VITE_SERVER_URL=http://localhost:5004/api
VITE_SOCKET_URL=http://localhost:5004
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
...
```
Start Client:
```bash
npm run dev
```

## 🔒 Security Architecture
1.  **Encryption**: Files are encrypted in the browser *before* upload using a generated key.
2.  **Key Management**: The key is part of the shareable link (hash fragment) and is *never* sent to the server.
3.  **Authentication**: Uploads require Firebase Authentication (ID Token verification).

## 📄 License
MIT
