import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import type { AdoptionStackParamList } from "../navigation/AdoptionStack";
import api from "../services/api";

// ================= TYPES =================
type RouteProps = RouteProp<AdoptionStackParamList, "AdoptionDetail">;
type NavProps = NativeStackNavigationProp<AdoptionStackParamList, "AdoptionDetail">;

type Adoption = {
    id: number;
    name?: string;
    type?: string;
    breed?: string;
    location?: string;
    description?: string;
    contact?: string;
    photoUrl?: string;
};

// ================= CONFIG =================
// Burayı ileride tek yerden değiştirirsin
const FALLBACK_IMAGE = require("../../assets/no-image.png");

// ================= IMAGE RESOLVER =================
function resolveImage(photoUrl?: string | null) {
    if (!photoUrl) return FALLBACK_IMAGE;

    if (
        photoUrl.includes("dsmcdn.com") ||
        photoUrl.includes("trendyol") ||
        photoUrl.includes("hepsiburada")
    ) {
        return FALLBACK_IMAGE;
    }

    if (photoUrl.startsWith("http")) {
        return { uri: photoUrl };
    }

    const base = api.defaults.baseURL || "";
    const normalized = photoUrl.startsWith("/") ? photoUrl : `/${photoUrl}`;
    return { uri: `${base}${normalized}` };
}

// ================= PHONE =================
function sanitizePhone(input?: string) {
    if (!input) return "";
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length === 10) digits = `90${digits}`;
    return digits;
}

// ================= SCREEN =================
export default function AdoptionDetailScreen() {
    const route = useRoute<RouteProps>();
    const navigation = useNavigation<NavProps>();

    const id = route.params?.id;

    const [loading, setLoading] = useState(true);
    const [adoption, setAdoption] = useState<Adoption | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ================= LOAD =================
    useEffect(() => {
        if (!id) return;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await api.get(`/api/Adoptions/${id}`);
                setAdoption(res.data);
            } catch (e: any) {
                console.log("❌ ADOPTION DETAIL LOAD ERROR:", e?.response?.data || e?.message);
                setError("İlan yüklenemedi");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const phoneDigits = useMemo(
        () => sanitizePhone(adoption?.contact),
        [adoption?.contact]
    );

    // ================= STATES =================
    if (!id) {
        return <NotFound navigation={navigation} />;
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#ff8800" />
            </View>
        );
    }

    if (error || !adoption) {
        return <NotFound navigation={navigation} />;
    }

    // ================= ACTIONS =================
    const openWhatsApp = async () => {
        if (!phoneDigits) {
            Alert.alert("İletişim yok", "Bu ilanda geçerli telefon bulunamadı.");
            return;
        }
        const msg = `Merhaba! Hurma'da "${adoption.name}" ilanını gördüm. Sahiplenmek istiyorum 🐾`;
        const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(msg)}`;
        await Linking.openURL(url);
    };

    const callPhone = async () => {
        if (!phoneDigits) {
            Alert.alert("İletişim yok", "Bu ilanda geçerli telefon bulunamadı.");
            return;
        }
        await Linking.openURL(`tel:+${phoneDigits}`);
    };

    // ================= UI =================
    return (
        <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 24 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={20} color="#ff8800" />
                    <Text style={styles.backText}>Geri</Text>
                </TouchableOpacity>
            </View>

            <Image
                source={resolveImage(adoption.photoUrl)}
                style={styles.photo}
                resizeMode="cover"
            />

            <View style={styles.card}>
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                        {adoption.name || "İsimsiz"}
                    </Text>
                    <View style={styles.typeBadge}>
                        <Ionicons name="paw" size={14} color="#fff" />
                        <Text style={styles.typeBadgeText}>{adoption.type || "PET"}</Text>
                    </View>
                </View>

                <Text style={styles.sub}>
                    {adoption.breed ? `${adoption.breed} • ` : ""}
                    {adoption.location ? `📍 ${adoption.location}` : ""}
                </Text>

                <Text style={styles.sectionTitle}>Açıklama</Text>
                <Text style={styles.desc}>
                    {adoption.description || "Açıklama eklenmemiş."}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>İletişim</Text>
                <View style={styles.contactRow}>
                    <Ionicons name="call" size={16} color="#ff8800" />
                    <Text style={styles.contactText}>
                        {adoption.contact || "İletişim yok"}
                    </Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[
                            styles.actionBtn,
                            { backgroundColor: phoneDigits ? "#25D366" : "#ccc" },
                        ]}
                        onPress={openWhatsApp}
                        disabled={!phoneDigits}
                    >
                        <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                        <Text style={styles.actionText}>WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.actionBtn,
                            { backgroundColor: phoneDigits ? "#ff8800" : "#ccc" },
                        ]}
                        onPress={callPhone}
                        disabled={!phoneDigits}
                    >
                        <Ionicons name="call" size={18} color="#fff" />
                        <Text style={styles.actionText}>Ara</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

// ================= NOT FOUND =================
function NotFound({ navigation }: any) {
    return (
        <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={36} color="#bbb" />
            <Text style={{ marginTop: 10, color: "#777", fontWeight: "700" }}>
                İlan bulunamadı
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.primaryText}>Geri</Text>
            </TouchableOpacity>
        </View>
    );
}

// ================= STYLES =================
const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#f8f9fb" },
    header: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8 },
    backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    backText: { color: "#ff8800", fontWeight: "900" },

    photo: { width: "100%", height: 320, backgroundColor: "#eee" },

    card: {
        marginTop: -18,
        backgroundColor: "#fff",
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        padding: 16,
        elevation: 3,
    },

    titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 26, fontWeight: "900", color: "#222", maxWidth: "72%" },
    sub: { marginTop: 6, color: "#666", fontWeight: "800" },

    typeBadge: {
        backgroundColor: "#ff8800",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    typeBadgeText: { color: "#fff", fontWeight: "900", fontSize: 12 },

    sectionTitle: { marginTop: 14, fontWeight: "900", color: "#222" },
    desc: { marginTop: 8, color: "#555", lineHeight: 22, fontSize: 15 },

    divider: { height: 1, backgroundColor: "#eee", marginTop: 14 },

    contactRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
    contactText: { color: "#333", fontWeight: "900" },

    actions: { flexDirection: "row", gap: 10, marginTop: 14 },
    actionBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    actionText: { color: "#fff", fontWeight: "900" },

    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    primaryBtn: {
        marginTop: 16,
        backgroundColor: "#ff8800",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
    },
    primaryText: { color: "#fff", fontWeight: "900" },
});
