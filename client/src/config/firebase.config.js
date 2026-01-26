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
    banner_detail: `<div style="padding: 24px; background: linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 82, 186, 0.15) 100%); border-radius: 20px; border: 1px solid rgba(15, 82, 186, 0.3); font-family: 'Inter', system-ui, sans-serif; box-shadow: 0 0 40px -10px rgba(15, 82, 186, 0.2);">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <div style="background: linear-gradient(135deg, rgba(15, 82, 186, 0.4), rgba(15, 82, 186, 0.1)); padding: 10px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 18px;">💎</span>
        </div>
        <div>
           <h3 style="margin: 0; color: #fff; font-size: 18px; font-weight: 700; letter-spacing: -0.5px;">Premium Update</h3>
           <span style="font-size: 12px; color: rgba(148, 163, 184, 0.8); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">v1.2.16</span>
        </div>
      </div>
      <p style="margin: 0 0 16px 0; color: #e2e8f0; font-size: 15px; line-height: 1.6;">
        Experience the new <b style="color: rgb(96, 165, 250);">Glassmorphism Design</b> with our signature Royal Blue theme.
      </p>
      <ul style="margin: 0; padding: 0; list-style: none;">
        <li style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; color: #cbd5e1; font-size: 14px;">
           <span style="color: rgb(52, 211, 153);">✓</span> New 6-digit smart codes
        </li>
        <li style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; color: #cbd5e1; font-size: 14px;">
           <span style="color: rgb(52, 211, 153);">✓</span> Enhanced Cloud Vault visibility
        </li>
        <li style="display: flex; align-items: center; gap: 10px; color: #cbd5e1; font-size: 14px;">
           <span style="color: rgb(52, 211, 153);">✓</span> Faster P2P connection speeds
        </li>
      </ul>
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
