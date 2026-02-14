import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function useFavorites() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const STORAGE_KEY = "@hurma_favorites";

    // 🧩 Uygulama açıldığında kayıtlı favorileri yükle
    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) setFavorites(JSON.parse(saved));
            } catch (error) {
                console.error("Favoriler yüklenemedi:", error);
            }
        })();
    }, []);

    // 💾 Favoriler her değiştiğinde kaydet
    useEffect(() => {
        (async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
            } catch (error) {
                console.error("Favoriler kaydedilemedi:", error);
            }
        })();
    }, [favorites]);

    // ❤️ Favori ekle/çıkar
    const toggleFavorite = (adoption: any) => {
        setFavorites((prev) => {
            const exists = prev.find((item) => item.id === adoption.id);
            if (exists) {
                return prev.filter((item) => item.id !== adoption.id);
            } else {
                return [...prev, adoption];
            }
        });
    };

    // 🔍 Belirli bir ilan favori mi?
    const isFavorite = (id: number) => favorites.some((item) => item.id === id);

    return { favorites, toggleFavorite, isFavorite };
}
