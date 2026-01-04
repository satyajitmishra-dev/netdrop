// Web Crypto API wrapper for Zero-Trust Encryption

class CryptoService {
    constructor() {
        this.algo = {
            name: "AES-GCM",
            length: 256,
        };
    }

    // 1. Generate a random File Key (for instant sharing)
    async generateKey() {
        return await window.crypto.subtle.generateKey(
            this.algo,
            true, // extractable
            ["encrypt", "decrypt"]
        );
    }

    // 2. Derive Key from Passcode (PBKDF2) - For password protected files
    async deriveKeyFromPasscode(passcode, salt) {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(passcode),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        return await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256",
            },
            keyMaterial,
            this.algo,
            true,
            ["encrypt", "decrypt"]
        );
    }

    // 3. Encrypt Data (Blob/ArrayBuffer)
    // Returns: { encryptedData, iv, salt? }
    async encrypt(data, key) {
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
        const encryptedContent = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            data
        );

        return {
            encryptedBlob: new Blob([encryptedContent]),
            iv: iv,
        };
    }

    // 4. Decrypt Data
    async decrypt(encryptedBuffer, key, iv) {
        return await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            encryptedBuffer
        );
    }

    // Helpers
    async exportKey(key) {
        const exported = await window.crypto.subtle.exportKey("jwk", key);
        return exported;
    }

    async importKey(jwk) {
        return await window.crypto.subtle.importKey(
            "jwk",
            jwk,
            this.algo,
            true,
            ["encrypt", "decrypt"]
        );
    }

    generateSalt() {
        return window.crypto.getRandomValues(new Uint8Array(16));
    }
}

export const cryptoService = new CryptoService();
