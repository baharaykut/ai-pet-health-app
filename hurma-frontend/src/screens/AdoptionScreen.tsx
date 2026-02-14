import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import type { Adoption, AdoptionStackParamList } from "../navigation/AdoptionStack";
import api from "../services/api";

// ✅ LOCAL FALLBACK
const FALLBACK_IMAGE = require("../../assets/no-image.png");

// ❗ DOĞRU SCREEN ADI: AdoptionHome
type NavProps = NativeStackNavigationProp<AdoptionStackParamList, "AdoptionHome">;

// ======================================================
// 🖼️ IMAGE RESOLVER
// ======================================================
function resolveImage(photoUrl?: string | null) {
    if (!photoUrl) return FALLBACK_IMAGE;

    // ❌ Hotlink engeli olan CDN'leri fallback yap
    if (
        photoUrl.includes("dsmcdn.com") ||
        photoUrl.includes("trendyol") ||
        photoUrl.includes("hepsiburada")
    ) {
        return FALLBACK_IMAGE;
    }

    // Tam URL ise
    if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
        return { uri: photoUrl };
    }

    // Relative path ise backend baseURL ile birleştir
    const base = api.defaults.baseURL || "";
    const normalized = photoUrl.startsWith("/") ? photoUrl : `/${photoUrl}`;
    return { uri: `${base}${normalized}` };
}

export default function AdoptionScreen() {
    const navigation = useNavigation<NavProps>();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [listRaw, setListRaw] = useState<Adoption[]>([]);

    // ======================================================
    // 📥 LOAD
    // ======================================================
    const loadAdoptions = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get<Adoption[]>("/api/Adoptions");
            setListRaw(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.log("❌ ADOPTION ERROR:", err?.response?.data || err?.message);
            Alert.alert("Hata", "İlanlar yüklenemedi");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAdoptions();
    }, [loadAdoptions]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAdoptions();
        setRefreshing(false);
    };

    // ======================================================
    // 🗑️ DELETE
    // ======================================================
    const deleteAdoption = async (id: number) => {
        Alert.alert("Sil", "Bu ilanı silmek istiyor musun?", [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil",
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.delete(`/api/Adoptions/${id}`);
                        Alert.alert("Silindi", "İlan silindi");
                        loadAdoptions();
                    } catch (err) {
                        Alert.alert("Hata", "İlan silinemedi");
                    }
                },
            },
        ]);
    };

    // ======================================================
    // 🔃 SORT
    // ======================================================
    const list = useMemo(() => {
        const arr = [...listRaw];
        arr.sort((a, b) => (b.id || 0) - (a.id || 0));
        return arr;
    }, [listRaw]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#ff8800" />
                <Text style={{ marginTop: 10 }}>İlanlar yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>🐾 Sahiplendirme</Text>

                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate("AddAdoption")}
                >
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.addBtnText}>İlan Ekle</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={list}
                keyExtractor={(item) => String(item.id)}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingBottom: 140 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.9}
                        onPress={() =>
                            navigation.navigate("AdoptionDetail", { id: item.id })
                        }
                    >
                        <Image
                            source={resolveImage(item.photoUrl)}
                            style={styles.image}
                            resizeMode="cover"
                        />

                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name || "İsimsiz"}</Text>

                            <Text style={styles.meta}>
                                {(item.type || "?")}{" "}
                                {item.breed ? `• ${item.breed}` : ""} • 📍{" "}
                                {item.location || "?"}
                            </Text>

                            <Text numberOfLines={2} style={styles.desc}>
                                {item.description || "Açıklama yok"}
                            </Text>

                            <View style={styles.bottom}>
                                <View style={styles.contact}>
                                    <Ionicons name="call" size={14} color="#ff8800" />
                                    <Text style={{ marginLeft: 6 }}>
                                        {item.contact || "-"}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: "row", gap: 10 }}>
                                    <Text style={styles.detail}>Detay</Text>

                                    <TouchableOpacity
                                        onPress={() => deleteAdoption(item.id)}
                                    >
                                        <Text style={{ color: "red", fontWeight: "900" }}>
                                            🗑️ Sil
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={{ textAlign: "center", marginTop: 40 }}>
                        Sonuç bulunamadı 😿
                    </Text>
                }
            />
        </View>
    );
}

// ======================================================
// 🎨 STYLES
// ======================================================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fb", padding: 16 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { fontSize: 26, fontWeight: "900" },

    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#ff8800",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    addBtnText: { color: "#fff", fontWeight: "900" },

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginTop: 14,
        overflow: "hidden",
        elevation: 3,
    },

    image: { width: "100%", height: 220, backgroundColor: "#eee" },

    info: { padding: 12 },
    name: { fontSize: 20, fontWeight: "900" },
    meta: { marginTop: 4, color: "#666", fontWeight: "700" },
    desc: { marginTop: 8, color: "#555" },

    bottom: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    contact: { flexDirection: "row", alignItems: "center" },

    detail: {
        backgroundColor: "#ff8800",
        color: "#fff",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        fontWeight: "900",
    },
});
