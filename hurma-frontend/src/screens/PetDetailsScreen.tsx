import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
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

import { usePets } from "../context/PetContext";
import api from "../services/api";
import colors from "../theme/colors";

// ================= URL JOIN =================
function joinUrl(base: string, path: string) {
    if (!base) return path;
    if (!path) return base;
    if (base.endsWith("/") && path.startsWith("/")) return base + path.substring(1);
    if (!base.endsWith("/") && !path.startsWith("/")) return base + "/" + path;
    return base + path;
}

const FALLBACK_IMAGE = "https://cdn-icons-png.flaticon.com/512/616/616408.png";

// ================= AI BASE URL =================
const AI_BASE_URL =
    process.env.EXPO_PUBLIC_AI_URL ||
    (Constants.expoConfig as any)?.extra?.EXPO_PUBLIC_AI_URL ||
    "";

const aiClient = axios.create({
    baseURL: (AI_BASE_URL || "").replace(/\/$/, ""),
    timeout: 120000,
    headers: { Accept: "application/json" },
});

export default function PetDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { petId } = route.params as { petId: number };

    const { pets, saveAIResultToPet, deletePet, refreshPets } = usePets();
    const pet = pets.find((p) => p.id === petId);

    const [imageError, setImageError] = useState(false);
    const [uploading, setUploading] = useState(false);

    // ===============================
    // 🔥 Son AI analizini çek (8000)
    // ===============================
    useEffect(() => {
        if (!petId) return;

        let cancelled = false;

        const loadLastAI = async () => {
            try {
                if (!aiClient.defaults.baseURL) {
                    console.log("⚠️ AI_BASE_URL yok (EXPO_PUBLIC_AI_URL tanımla).");
                    return;
                }

                const url = `/ai/history/pet/${petId}`;
                console.log("📜 AI HISTORY GET:", `${aiClient.defaults.baseURL}${url}`);

                const res = await aiClient.get(url);

                if (cancelled) return;

                if (Array.isArray(res.data) && res.data.length > 0) {
                    const last = res.data[0];

                    saveAIResultToPet(petId, {
                        notes: last.details || last.summary,
                        score: last.confidence,
                        warning:
                            last.status === "warning" || last.status === "critical"
                                ? last.summary
                                : undefined,
                    });
                }
            } catch (err: any) {
                console.log("PET AI LOAD ERROR:", err?.response?.status, err?.message || err);
            }
        };

        loadLastAI();
        return () => {
            cancelled = true;
        };
    }, [petId, saveAIResultToPet]);

    if (!pet) {
        return (
            <View style={styles.center}>
                <Text style={{ color: colors.muted }}>Hayvan bulunamadı 🐾</Text>
            </View>
        );
    }

    // ===============================
    // IMAGE RESOLVE
    // ===============================
    const rawPhoto = (pet as any).photoUrl || (pet as any).photo || null;

    const imageUri = imageError
        ? FALLBACK_IMAGE
        : rawPhoto
            ? rawPhoto.startsWith("http")
                ? rawPhoto
                : joinUrl(api.defaults.baseURL || "", rawPhoto)
            : FALLBACK_IMAGE;

    // ===============================
    // AI SCORE
    // ===============================
    const aiScore = typeof (pet as any).aiScore === "number" ? (pet as any).aiScore : null;

    const aiColor = useMemo(() => {
        if (aiScore == null) return colors.muted;
        if (aiScore >= 80) return "#16a34a";
        if (aiScore >= 50) return "#f59e0b";
        return "#dc2626";
    }, [aiScore]);

    const confirmDelete = () => {
        Alert.alert("Sil", `${pet.name} silinsin mi?`, [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil",
                style: "destructive",
                onPress: async () => {
                    await deletePet(pet.id);
                    navigation.goBack();
                },
            },
        ]);
    };

    // ===============================
    // 📸 FOTO DEĞİŞTİR (TAM UYUMLU)
    // ===============================
    const changePhoto = async () => {
        if (uploading) return;

        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert("İzin gerekli", "Galeri izni vermelisin");
                return;
            }

            // ✅ Senin sürümde güvenli olan:
            const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });

            if (res.canceled) return;

            const uri = res.assets?.[0]?.uri;
            if (!uri) {
                Alert.alert("Hata", "Foto seçilemedi");
                return;
            }

            if (!api.defaults.baseURL) {
                Alert.alert("API Hatası", "API baseURL boş. EXPO_PUBLIC_API_BASE_URL kontrol et.");
                return;
            }

            console.log("📤 RAW URI:", uri);

            setUploading(true);

            const form = new FormData();
            form.append("photo", {
                uri,
                name: "pet.jpg",
                type: "image/jpeg",
            } as any);

            // api.ts içinde token set ediyorsun; ama fetch için buradan alacağız:
            const authHeader =
                (api.defaults.headers as any)?.common?.Authorization ||
                (api.defaults.headers as any)?.Authorization ||
                "";

            const uploadUrl = `${api.defaults.baseURL}/api/Pets/${pet.id}/upload-photo`;
            console.log("📤 FETCH UPLOAD URL:", uploadUrl);
            console.log("🔐 AUTH HEADER:", authHeader ? "VAR" : "YOK");

            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    Authorization: authHeader, // "Bearer xxx" şeklinde gelmeli
                    Accept: "application/json",
                    // ❗ Content-Type YOK (fetch boundary kendisi koyacak)
                },
                body: form,
            });

            const bodyText = await response.text();
            console.log("📤 UPLOAD RAW RESPONSE:", bodyText);

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} - ${bodyText}`);
            }

            // başarılıysa JSON gibi döner, ama text parse etmeyi deniyoruz:
            try {
                const json = JSON.parse(bodyText || "{}");
                console.log("✅ UPLOAD OK JSON:", json);
            } catch {
                console.log("✅ UPLOAD OK (non-json)");
            }

            await refreshPets();
            setImageError(false);
            Alert.alert("✅ Başarılı", "Fotoğraf güncellendi");
        } catch (e: any) {
            console.log("❌ PHOTO UPLOAD ERROR FULL:", e);
            Alert.alert("❌ Hata", "Foto yüklenemedi: " + (e?.message || ""));
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* ================= HEADER IMAGE ================= */}
            <View style={styles.heroWrap}>
                <TouchableOpacity onPress={changePhoto} activeOpacity={0.9}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.heroImage}
                        onError={() => setImageError(true)}
                    />
                    {uploading && (
                        <View style={styles.uploadOverlay}>
                            <ActivityIndicator color="#fff" />
                            <Text style={styles.uploadText}>Yükleniyor...</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.75)"]}
                    style={styles.heroGradient}
                />

                <View style={styles.heroTopBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>

                    <View style={{ flexDirection: "row", gap: 14 }}>
                        <TouchableOpacity onPress={() => navigation.navigate("PetEdit", { petId: pet.id })}>
                            <Ionicons name="create-outline" size={24} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={confirmDelete}>
                            <Ionicons name="trash-outline" size={24} color="#ffdddd" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.heroBottom}>
                    <Text style={styles.heroName}>{pet.name}</Text>
                    <Text style={styles.heroSub}>
                        {pet.type || "?"} • {pet.breed || "?"}
                    </Text>
                </View>
            </View>

            {/* ================= QUICK STATS ================= */}
            <View style={styles.quickGrid}>
                <StatCard label="Yaş" value={(pet as any).age || "-"} icon="time-outline" />
                <StatCard label="Kilo" value={(pet as any).weight || "-"} icon="fitness-outline" />
                <StatCard label="Boy" value={(pet as any).height || "-"} icon="resize-outline" />
                <StatCard label="Tür" value={(pet as any).type || "-"} icon="paw-outline" />
            </View>

            {/* ================= AI CARD ================= */}
            <View style={[styles.card, styles.aiCard]}>
                <SectionTitle icon="sparkles-outline" text="AI Sağlık Analizi" />

                {(pet as any).aiNotes ? (
                    <>
                        <View style={styles.aiScoreRow}>
                            <Text style={[styles.aiScore, { color: aiColor }]}>%{aiScore ?? "—"}</Text>

                            <View style={styles.aiBadgeWrap}>
                                <View style={[styles.aiBadge, { backgroundColor: aiColor }]} />
                                <Text style={styles.aiBadgeText}>
                                    {aiScore == null
                                        ? "Bilinmiyor"
                                        : aiScore >= 80
                                            ? "Sağlıklı"
                                            : aiScore >= 50
                                                ? "Riskli"
                                                : "Kritik"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${Math.min(Math.max(aiScore ?? 0, 0), 100)}%`,
                                        backgroundColor: aiColor,
                                    },
                                ]}
                            />
                        </View>

                        <Text style={styles.aiText}>{(pet as any).aiNotes}</Text>

                        <TouchableOpacity
                            style={styles.aiButton}
                            onPress={() => navigation.navigate("AIHistory", { petId: pet.id })}
                        >
                            <Ionicons name="analytics-outline" size={18} color="#fff" />
                            <Text style={styles.aiButtonText}>Analiz Geçmişi</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.aiText}>Henüz yapay zekâ analizi yapılmadı.</Text>

                        <TouchableOpacity
                            style={styles.aiButton}
                            onPress={() => navigation.navigate("HealthAI", { petId: pet.id })}
                        >
                            <Ionicons name="pulse-outline" size={18} color="#fff" />
                            <Text style={styles.aiButtonText}>AI Tarama Başlat</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* ================= VACCINES ================= */}
            <View style={styles.card}>
                <SectionTitle icon="medkit-outline" text="Aşı Takvimi" />

                <VaccineRow title="Kuduz" date={(pet as any).rabiesVaccineDate} />
                <VaccineRow title="İç Parazit" date={(pet as any).internalParasiteDate} />
                <VaccineRow title="Dış Parazit" date={(pet as any).externalParasiteDate} />
            </View>
        </ScrollView>
    );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, icon }: { label: string; value: string; icon: any }) {
    return (
        <View style={styles.statCard}>
            <Ionicons name={icon} size={20} color={colors.primary} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function SectionTitle({ icon, text }: { icon: any; text: string }) {
    return (
        <View style={styles.sectionTitle}>
            <Ionicons name={icon} size={18} color={colors.primary} />
            <Text style={styles.sectionText}>{text}</Text>
        </View>
    );
}

function VaccineRow({ title, date }: { title: string; date?: string | null }) {
    const text = date ? new Date(date).toLocaleDateString("tr-TR") : "Girilmeli";

    return (
        <View
            style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: "#eee",
                flexDirection: "row",
                justifyContent: "space-between",
            }}
        >
            <Text style={{ fontWeight: "700", color: colors.text }}>{title}</Text>
            <Text style={{ color: date ? colors.primary : colors.danger, fontWeight: "700" }}>
                {text}
            </Text>
        </View>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },

    heroWrap: { height: 280, position: "relative", marginBottom: 12 },
    heroImage: { width: "100%", height: "100%" },
    heroGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 160 },

    uploadOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    uploadText: { color: "#fff", fontWeight: "800" },

    heroTopBar: {
        position: "absolute",
        top: 40,
        left: 16,
        right: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    heroBottom: { position: "absolute", bottom: 16, left: 16 },
    heroName: { fontSize: 26, fontWeight: "900", color: "#fff" },
    heroSub: { fontSize: 14, color: "#eee", fontWeight: "600" },

    quickGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 10 },
    statCard: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    statValue: { fontSize: 18, fontWeight: "900", marginTop: 4, color: colors.text },
    statLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },

    card: {
        backgroundColor: "#fff",
        borderRadius: 22,
        padding: 16,
        margin: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    aiCard: { backgroundColor: colors.cardAlt },

    sectionTitle: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
    sectionText: { fontSize: 15, fontWeight: "700", color: colors.primary },

    aiScoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    aiScore: { fontSize: 34, fontWeight: "900" },

    aiBadgeWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
    aiBadge: { width: 10, height: 10, borderRadius: 5 },
    aiBadgeText: { fontSize: 13, fontWeight: "700", color: colors.text },

    progressBarBg: {
        height: 10,
        backgroundColor: "#e5e7eb",
        borderRadius: 5,
        overflow: "hidden",
        marginVertical: 10,
    },
    progressBarFill: { height: "100%", borderRadius: 5 },

    aiText: { fontSize: 13, color: colors.text, marginBottom: 12, lineHeight: 18 },

    aiButton: {
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 999,
    },
    aiButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
