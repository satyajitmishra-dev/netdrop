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
    banner_detail: "" // HTML/Text for popup details
};

export { fetchAndActivate, getValue };
