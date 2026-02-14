import { Platform } from "react-native";

export const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (Platform.OS === "web"
        ? "http://localhost:5058"
        : "http://10.0.2.2:5058"); // Android emulator

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
