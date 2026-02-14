// src/api/hurma.ts
import axios from "axios";

// ⚠️ BURAYA KENDİ IP'NI YAZ! ⚠️
const YOUR_COMPUTER_IP = "192.168.1.35"; // DEĞİŞTİR!

const API_BASE_URL = `http://${YOUR_COMPUTER_IP}:8000`;

const API = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 saniye timeout
    headers: {
        "Accept": "application/json",
    }
});

// Test bağlantısı
export const testConnection = async () => {
    try {
        const response = await API.get("/test/connection");
        return response.data;
    } catch (error) {
        console.error("Backend bağlantı hatası:", error);
        throw error;
    }
};

// Pet analizi
export const analyzePet = async (formData: FormData) => {
    try {
        console.log("📤 AI'ya gönderiliyor...");
        const response = await API.post("/analyze", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Accept": "application/json"
            },
            timeout: 45000, // 45 saniye
        });
        console.log("✅ AI analiz tamamlandı");
        return response.data;
    } catch (error: any) {
        console.error("AI analiz hatası:", error);

        // Hata detaylarını göster
        if (error.response) {
            console.error("Hata durumu:", error.response.status);
            console.error("Hata mesajı:", error.response.data);
        }

        throw error;
    }
};

// Veterinerleri getir
export const getNearbyVets = async (lat: number, lng: number) => {
    try {
        const response = await API.get("/vets", {
            params: { lat, lng }
        });
        return response.data;
    } catch (error) {
        console.error("Veteriner getirme hatası:", error);
        throw error;
    }
};

// Geçmiş analizler
export const getAnalysisHistory = async (userId: number) => {
    try {
        const response = await API.get(`/ai/history/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Geçmiş getirme hatası:", error);
        throw error;
    }
};

// Tek analiz detayı
export const getAnalysisDetail = async (analysisId: number) => {
    try {
        const response = await API.get(`/ai/${analysisId}`);
        return response.data;
    } catch (error) {
        console.error("Analiz detay hatası:", error);
        throw error;
    }
};

// Sağlık kontrolü
export const healthCheck = async () => {
    try {
        const response = await API.get("/health");
        return response.data;
    } catch (error) {
        console.error("Health check hatası:", error);
        throw error;
    }
};

// Test upload
export const testUpload = async (fileUri: string, text: string = "test") => {
    try {
        const formData = new FormData();

        // Dosyayı ekle
        const file = {
            uri: fileUri,
            name: 'test_image.jpg',
            type: 'image/jpeg'
        } as any;

        formData.append('file', file);
        formData.append('text', text);

        const response = await API.post("/test/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    } catch (error) {
        console.error("Test upload hatası:", error);
        throw error;
    }
};

export default API;