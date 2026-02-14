import axios from "axios";

/*
 ⚠️ ÇOK ÖNEMLİ:
  - Web:              http://localhost:5000/api
  - Android Emulator: http://10.0.2.2:5000/api
  - Gerçek Telefon:   http://BILGISAYAR_IP:5000/api
*/

// 🔴 EĞER TELEFONDAN BAĞLANACAKSAN BURAYI DEĞİŞTİR
const BASE_URL = "http://localhost:5000";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        Accept: "application/json",
    },
});

// =============================
// 🔐 TOKEN INTERCEPTOR
// =============================
api.interceptors.request.use(
    (config) => {
        try {
            const token = (globalThis as any)?.AUTH_TOKEN;

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.warn("Token okunamadı:", e);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// =============================
// ❌ GLOBAL ERROR HANDLER
// =============================
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error("API Error:", {
                url: error.config?.url,
                status: error.response.status,
                data: error.response.data,
            });
        } else if (error.request) {
            console.error("Sunucuya ulaşılamıyor:", error.message);
        } else {
            console.error("Axios hatası:", error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
