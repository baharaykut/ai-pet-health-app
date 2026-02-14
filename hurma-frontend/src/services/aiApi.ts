import axios from "axios";
import { Platform } from "react-native";

const PC_IP = "10.189.4.112";


const AI_BASE_URL =
    Platform.OS === "web"
        ? "http://localhost:8000"
        : `http://${PC_IP}:8000`;

console.log("🤖 AI API BASE URL:", AI_BASE_URL);

const aiApi = axios.create({
    baseURL: AI_BASE_URL,
    timeout: 120000,
    headers: {
        Accept: "application/json",
    },
});

// Request debug
aiApi.interceptors.request.use((req) => {
    const fullUrl = (req.baseURL || "") + (req.url || "");
    console.log("➡️ AI REQUEST:", fullUrl);
    return req;
});

// Response debug
aiApi.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.log("❌ AI API ERROR:", status ?? "", data ?? err.message);
        return Promise.reject(err);
    }
);

export default aiApi;
