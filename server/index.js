import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.config.js";
import { SignalingService } from "./services/signaling.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Trust Proxy (Required for Production behind Nginx/Load Balancers)
app.set("trust proxy", 1);

// Force HTTPS Redirect (Production)
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return res.redirect(`https://${req.header('host')}${req.url}`);
        }
        next();
    });
}

// Allowed Origins (supports both www and non-www)
const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://netdrop.site",
    "https://www.netdrop.site",
    "http://localhost:5173"
].filter(Boolean);

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, origin);
        } else {
            callback(new Error("CORS not allowed for origin: " + origin));
        }
    },
    credentials: true
}));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            connectSrc: ["'self'", "wss:", "ws:", "https:"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        }
    },
    crossOriginEmbedderPolicy: false, // Required for WebRTC
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xFrameOptions: { action: "sameorigin" } // Prevents clickjacking
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Serve Static Files (Production)
app.use(express.static(path.join(__dirname, "../client/dist")));

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Initialize Services
new SignalingService(io);

import fileRoutes from "./routes/file.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import statsRoutes from "./routes/stats.routes.js";
app.use("/api/files", fileRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/stats", statsRoutes);

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// SPA Fallback (Serve index.html for non-API routes)
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const PORT = process.env.PORT || 5004;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket Signaling active`);
});
