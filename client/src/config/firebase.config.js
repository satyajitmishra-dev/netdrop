import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.apiKey) {
    console.error("❌ Firebase API Key is MISSING in client/.env! Secure Cloud features will fail.");
    console.error("Check if .env file exists and starts with VITE_FIREBASE_...");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Remote Config
export const remoteConfig = getRemoteConfig(app);
// In development, fetch fresh every time. In production, cache for 1 hour.
remoteConfig.settings.minimumFetchIntervalMillis = import.meta.env.DEV ? 0 : 3600000;
remoteConfig.defaultConfig = {
    app_version: "v2.2.4",
    banner_enabled: false,
    banner_text: "",
    banner_link: "",
    banner_type: "info",
    banner_detail: `<div style="padding: 20px; background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 82, 186, 0.1) 100%); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); font-family: sans-serif;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <div style="background: rgba(15, 82, 186, 0.3); padding: 8px; border-radius: 10px; color: #fff;">✨</div>
        <h3 style="margin: 0; color: #fff; font-size: 16px; font-weight: 600;">Redesigned Experience</h3>
      </div>
      <p style="margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Connect devices faster than ever with our new <b style="color: #60a5fa;">6-digit smart codes</b>. Now featuring a cleaner interface and direct paste support!
      </p>
    </div>`, // HTML/Text for popup details
    feature_list: JSON.stringify([
        { icon: "Zap", title: "P2P Transfer", desc: "Direct device-to-device", color: "from-amber-500 to-orange-600" },
        { icon: "Shield", title: "E2E Encrypted", desc: "Military-grade security", color: "from-emerald-500 to-teal-600" },
        { icon: "Globe", title: "Cross-Platform", desc: "Any device, any OS", color: "from-blue-500 to-cyan-600" },
        { icon: "Users", title: "Room Codes", desc: "Multi-device sharing", color: "from-purple-500 to-pink-600" },
        { icon: "Cloud", title: "Cloud Vault", desc: "Secure remote access", color: "from-cyan-500 to-blue-600" },
        { icon: "Wifi", title: "Any Network", desc: "WiFi, mobile, hotspot", color: "from-pink-500 to-rose-600" }
    ])
};

export { fetchAndActivate, getValue };
