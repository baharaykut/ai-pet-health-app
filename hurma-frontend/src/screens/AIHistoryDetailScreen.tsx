import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import colors from "../theme/colors";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/* ================= TYPES ================= */

type AnalysisDetail = {
    id: number;
    imageUrl?: string | null;
    createdAt: string;
    status: string;
    confidence: number;
    summary: string;
    pet?: {
        id: number;
        name: string;
    } | null;
};

/* ================= HELPERS ================= */

function formatPct(value: number) {
    const v = Number(value) || 0;
    const pct = v <= 1 ? v * 100 : v;
    return pct.toFixed(1);
}

/* ================= SCREEN ================= */

export default function AIHistoryDetailScreen({ route, navigation }: any) {
    const { analysisId } = route.params;

    const [data, setData] = useState<AnalysisDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            setErrorText(null);

            if (!API_BASE_URL) {
                setErrorText("❌ API URL bulunamadı (.env)");
                return;
            }

            const token = await AsyncStorage.getItem("auth_token");
            if (!token) {
                setErrorText("❌ Oturum bulunamadı");
                return;
            }

            // ✅ BURASI DÜZELTİLDİ
            const url = `${API_BASE_URL}/api/Ai/${analysisId}`;
            console.log("🔍 AI DETAIL GET:", url);

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const json = await res.json();
            console.log("🔍 AI DETAIL RAW:", json);

            setData(json);
        } catch (err: any) {
            console.error("AI DETAIL ERROR:", err);
            setErrorText(err?.message || "Bilinmeyen hata");
        } finally {
            setLoading(false);
        }
    };

    // =================================================
    // 🗑️ DELETE
    // =================================================
    const confirmDelete = () => {
        Alert.alert(
            "Analizi Sil",
            "Bu analizi kalıcı olarak silmek istediğine emin misin?",
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: deleteAnalysis,
                },
            ]
        );
    };

    const deleteAnalysis = async () => {
        try {
            setDeleting(true);

            if (!API_BASE_URL) throw new Error("API URL yok");

            const token = await AsyncStorage.getItem("auth_token");
            if (!token) throw new Error("Token yok");

            const url = `${API_BASE_URL}/api/Ai/${analysisId}`;
            console.log("🗑️ AI DELETE:", url);

            const res = await fetch(url, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error(`Silinemedi: HTTP ${res.status}`);
            }

            Alert.alert("✅ Silindi", "Analiz başarıyla silindi.");
            navigation.goBack();
        } catch (err: any) {
            console.error("DELETE ERROR:", err);
            Alert.alert("❌ Hata", err?.message || "Silme sırasında hata oluştu");
        } finally {
            setDeleting(false);
        }
    };

    /* ================= UI STATES ================= */

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 12 }}>Yükleniyor...</Text>
            </View>
        );
    }

    if (errorText || !data) {
        return (
            <View style={styles.center}>
                <Text style={{ color: colors.muted, textAlign: "center" }}>
                    ❌ {errorText || "Veri alınamadı"}
                </Text>

                <Text
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: 16, color: colors.primary, fontWeight: "700" }}
                >
                    ← Geri Dön
                </Text>
            </View>
        );
    }

    const imageUri = data.imageUrl
        ? data.imageUrl.startsWith("http")
            ? data.imageUrl
            : API_BASE_URL + data.imageUrl
        : null;

    return (
        <ScrollView style={styles.container}>
            {/* ================= IMAGE ================= */}
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
                <View style={styles.noImage}>
                    <Text style={{ color: colors.muted }}>📷 Fotoğraf yok</Text>
                </View>
            )}

            {/* ================= HEADER ================= */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>
                    🐾 {data.pet?.name ?? "Bilinmeyen Hayvan"}
                </Text>

                <TouchableOpacity
                    onPress={confirmDelete}
                    disabled={deleting}
                    style={styles.deleteBtn}
                >
                    <Text style={styles.deleteText}>
                        {deleting ? "..." : "🗑️ Sil"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.dateText}>
                📅 {new Date(data.createdAt).toLocaleString()}
            </Text>

            {/* ================= CARDS ================= */}

            <View style={styles.card}>
                <Text style={styles.label}>⚠️ Risk Seviyesi</Text>
                <Text style={styles.value}>{data.status}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>📊 AI Güven</Text>
                <Text style={styles.value}>%{formatPct(data.confidence)}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>🧠 AI Özeti</Text>
                <Text style={styles.summary}>{data.summary}</Text>
            </View>
        </ScrollView>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },

    image: {
        width: "100%",
        height: 260,
        borderRadius: 16,
        marginBottom: 16,
        backgroundColor: "#eee",
    },

    noImage: {
        width: "100%",
        height: 260,
        borderRadius: 16,
        marginBottom: 16,
        backgroundColor: "#f2f2f2",
        alignItems: "center",
        justifyContent: "center",
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    title: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.text,
        flex: 1,
        marginRight: 10,
    },

    deleteBtn: {
        backgroundColor: "#ffe5e5",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },

    deleteText: {
        color: "#c62828",
        fontWeight: "800",
    },

    dateText: {
        marginTop: 4,
        marginBottom: 12,
        color: colors.muted,
    },

    card: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },

    label: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.muted,
        marginBottom: 4,
    },

    value: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.text,
    },

    summary: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
    },
});
