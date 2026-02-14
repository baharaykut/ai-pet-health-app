import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

// ======================================================
// 🌍 BASE URL (ASP.NET API)
// ======================================================

// 🔥 SENİN PC IP'N (EN GARANTİ)
const FALLBACK_API = "http://10.77.82.112:5058";

let API_BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (Constants.expoConfig as any)?.extra?.EXPO_PUBLIC_API_BASE_URL ||
    (Constants.manifest as any)?.extra?.EXPO_PUBLIC_API_BASE_URL ||
    FALLBACK_API;

// sondaki slash varsa sil
API_BASE_URL = API_BASE_URL.replace(/\/$/, "");

// son güvenlik: hala yoksa fallback
if (!API_BASE_URL || !API_BASE_URL.startsWith("http")) {
    console.warn("⚠️ API URL bulunamadı, FALLBACK kullanılıyor!");
    API_BASE_URL = FALLBACK_API;
}

console.log("🌍🌍🌍 API BASE URL KESİN:", API_BASE_URL);

// ======================================================
// AXIOS INSTANCE
// ======================================================

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 180000,
    headers: {
        Accept: "application/json",
    },
});

// ======================================================
// 🔐 TOKEN MEMORY + STORAGE
// ======================================================

let memoryToken: string | null = null;

// ======================================================
// 💾 TOKEN SET
// ======================================================

export const setApiToken = async (token: string | null) => {
    memoryToken = token;

    if (token) {
        await AsyncStorage.setItem("auth_token", token);
        console.log("🔐 API TOKEN SET (saved)");
    } else {
        await AsyncStorage.removeItem("auth_token");
        console.log("🔐 API TOKEN CLEARED");
    }
};

// ======================================================
// 📤 TOKEN GET  ✅ EKLENDİ (SORUNU ÇÖZEN KISIM)
// ======================================================

export const getApiToken = () => memoryToken;

// ======================================================
// 📥 TOKEN LOAD
// ======================================================

export const loadApiTokenFromStorage = async () => {
    try {
        const token = await AsyncStorage.getItem("auth_token");
        if (token) {
            memoryToken = token;
            console.log("🔁 API TOKEN LOADED FROM STORAGE");
        } else {
            console.log("ℹ️ No token in storage");
        }
    } catch (e) {
        console.log("❌ TOKEN LOAD ERROR:", e);
    }
};

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

api.interceptors.request.use(
    async (config) => {
        config.headers = config.headers ?? {};

        // lazy load token
        if (!memoryToken) {
            const stored = await AsyncStorage.getItem("auth_token");
            if (stored) {
                memoryToken = stored;
                console.log("🔁 TOKEN PULLED FROM STORAGE (LAZY)");
            }
        }

        if (memoryToken) {
            (config.headers as any).Authorization = `Bearer ${memoryToken}`;
            console.log("➡️ AUTH HEADER:", config.method?.toUpperCase(), config.url);
        } else {
            console.log("⚠️ TOKEN YOK:", config.method?.toUpperCase(), config.url);
        }

        // ======================================================
        // 🧩 MULTIPART FIX (axios boundary kendisi koysun)
        // ======================================================
        const ct =
            (config.headers as any)["Content-Type"] ||
            (config.headers as any)["content-type"];

        if (ct && ct.toString().includes("multipart/form-data")) {
            delete (config.headers as any)["Content-Type"];
            delete (config.headers as any)["content-type"];
            console.log("🧹 multipart content-type temizlendi");
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        if (err?.response) {
            console.log("❌ API ERROR STATUS:", err.response.status);
            console.log("❌ API ERROR DATA:", err.response.data);

            if (err.response.status === 401) {
                console.log("🚨 TOKEN INVALID — CLEARING");
                await setApiToken(null);
            }
        } else {
            console.log("❌ API NETWORK ERROR:", err.message);
            console.log("❌ BASE URL USED:", API_BASE_URL);
        }

        return Promise.reject(err);
    }
);

export default api;
