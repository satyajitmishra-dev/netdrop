# NetDrop Deployment Guide 🚀

Since NetDrop uses **WebSockets** (for device discovery) and **Client-Side Encryption**, we use a hybrid deployment:

*   **Frontend**: Vercel (Fastest Global CDN for React).
*   **Backend**: Render (Keeps the WebSocket server running).

---

## Part 1: Deploy Backend (Render)

1.  **Sign Up/Login**: Go to [dashboard.render.com](https://dashboard.render.com/) and login with GitHub.
2.  **New Web Service**: Click **New +** -> **Web Service**.
3.  **Connect Repo**: Select your `netdrop` repository.
4.  **Configure Service**:
    *   **Name**: `netdrop-server` (or unique name).
    *   **Root Directory**: `server` (IMPORTANT: Don't leave blank).
    *   **Runtime**: Node.
    *   **Build Command**: `npm run build` (This runs the new root script).
    *   **Start Command**: `npm start`.
    *   **Instance Type**: Free (or Starter if you want 24/7 uptime).
5.  **Environment Variables**:
    Scroll down to "Environment Variables" and Add the following from your `server/.env`:
    *   `MONGO_URI`: (Your MongoDB Connection String)
    *   `R2_ACCOUNT_ID`: ...
    *   `R2_ACCESS_KEY_ID`: ...
    *   `R2_SECRET_ACCESS_KEY`: ...
    *   `R2_BUCKET_NAME`: ...
    *   `FIREBASE_SERVICE_ACCOUNT`: (Paste the entire JSON string)
    *   `PORT`: `10000` (Render sets this auto-magically, but good to know).
6.  **Deploy**: Click **Create Web Service**.
7.  **Deploy** and copy the **Render URL** (e.g., `https://netdrop-server.onrender.com`).

> **⚠️ Important: Prevent Sleeping**
> Render's free tier spins down after 15 minutes of inactivity. To keep it awake 24/7 for free:
> 1.  Go to [cron-job.org](https://cron-job.org/en/) (Free).
> 2.  Create a generic cron job.
> 3.  **URL**: `https://netdrop-server.onrender.com/health` (The health check endpoint).
> 4.  **Schedule**: Every 14 minutes.
> 5.  This keeps your WebSocket server active ready for instant connections! You need this for Part 2.

> **Note**: The Free tier on Render "sleeps" after 15 mins of inactivity. The first request might take 30s to wake it up.

---

## Part 2: Deploy Frontend (Vercel)

1.  **Sign Up/Login**: Go to [vercel.com](https://vercel.com/) and login with GitHub.
2.  **Add New**: Click **Add New...** -> **Project**.
3.  **Import Repo**: Import `netdrop`.
4.  **Configure Project**:
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Root Directory**: Click "Edit" and select `client`.
5.  **Environment Variables**:
    Add the following:
    *   `VITE_SERVER_URL`: `https://your-render-url.onrender.com/api` (Add `/api` at the end).
    *   `VITE_SOCKET_URL`: `https://your-render-url.onrender.com` (NO `/api` here).
    *   `VITE_FIREBASE_API_KEY`: ...
    *   `VITE_FIREBASE_AUTH_DOMAIN`: ...
    *   `VITE_FIREBASE_PROJECT_ID`: ...
    *   `VITE_FIREBASE_STORAGE_BUCKET`: ...
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID`: ...
    *   `VITE_FIREBASE_APP_ID`: ...
6.  **Deploy**: Click **Deploy**.

---

## Part 4: Custom Domain (`netdrop.site`) 🌐

1.  **Vercel Settings**:
    *   Go to your Project Settings -> **Domains**.
    *   Add `netdrop.site`.
    *   Follow the instructions to route your DNS (add A record or CNAME) from your domain provider to Vercel.

2.  **Environment Variables**:
    *   Once your domain is active, make sure your Client's `VITE_SERVER_URL` and `VITE_SOCKET_URL` still point to your **Render Backend URL**.
    *   (Optional) If you later map a subdomain like `api.netdrop.site` to Render, update these variables accordingly.

3.  **CORS**:
    *   The server code has been updated to allow `https://netdrop.site`.
    *   R2 bucket is configured to allow `*` (all origins), so it will work automatically.
