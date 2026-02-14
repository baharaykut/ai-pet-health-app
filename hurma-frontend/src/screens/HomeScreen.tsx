import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import colors from "../theme/colors";

const { width } = Dimensions.get("window");
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

// ================= IMAGE RESOLVER =================
function resolvePhoto(url?: string | null) {
    if (!url) return "https://placekitten.com/600/400";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
    return `${API_BASE_URL}/${url}`;
}

// ================= TYPES =================
type VaccineItem = {
    petId: number;
    petName: string;
    vaccine: string;
    date: string;
    daysLeft: number;
};

export default function HomeScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<any>();

    const [loading, setLoading] = useState(true);
    const [myPets, setMyPets] = useState<any[]>([]);
    const [vaccines, setVaccines] = useState<VaccineItem[]>([]);
    const [adoptions, setAdoptions] = useState<any[]>([]);

    const sliderRef = useRef<ScrollView>(null);
    const slideIndex = useRef(0);

    const HERO_SLIDES = [
        {
            image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
            title: "Hurma AI 🧠",
            subtitle: "Hayvanlarının sağlığı artık güvende",
        },
        {
            image: "https://images.unsplash.com/photo-1517849845537-4d257902454a",
            title: "AI Analiz 🤖",
            subtitle: "Fotoğraf yükle, riski gör",
        },
        {
            image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e",
            title: "Veterinerler 🏥",
            subtitle: "En yakındakini bul",
        },
    ];

    // ================= LOAD DASHBOARD =================
    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);

            const res = await api.get("/api/Home/dashboard");

            console.log("📦 DASHBOARD DATA:", res.data);

            setMyPets(Array.isArray(res.data?.myPets) ? res.data.myPets : []);
            setVaccines(Array.isArray(res.data?.vaccines) ? res.data.vaccines : []);
            setAdoptions(Array.isArray(res.data?.adoptions) ? res.data.adoptions : []);
        } catch (e) {
            console.log("❌ Dashboard load error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadDashboard();
        }, [loadDashboard])
    );

    // ================= HERO SLIDER =================
    useEffect(() => {
        const timer = setInterval(() => {
            slideIndex.current = (slideIndex.current + 1) % HERO_SLIDES.length;
            sliderRef.current?.scrollTo({
                x: slideIndex.current * width,
                animated: true,
            });
        }, 3500);

        return () => clearInterval(timer);
    }, []);

    // ================= AŞI YAPILDI =================
    const markDone = async (petId: number, type: string) => {
        try {
            await api.put(`/api/Pets/${petId}/mark-vaccine-done?type=${encodeURIComponent(type)}`);
            Alert.alert("✅ Tamam", "Aşı yapıldı olarak işaretlendi");
            loadDashboard();
        } catch (e) {
            console.log("❌ MARK DONE ERROR:", e);
            Alert.alert("❌ Hata", "İşlem başarısız");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* HEADER */}
            <View style={styles.welcomeRow}>
                <Text style={styles.welcomeText}>
                    Hoş geldin {user?.fullName || user?.name || "Kullanıcı"} 👋
                </Text>
                <Text style={styles.welcomeSub}>
                    Bugün {myPets.length} dostun var 🐾
                </Text>
            </View>

            {/* HERO */}
            <ScrollView ref={sliderRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                {HERO_SLIDES.map((slide, i) => (
                    <View key={i} style={styles.heroSlide}>
                        <Image source={{ uri: slide.image }} style={styles.heroImage} />
                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.7)"]}
                            style={styles.heroOverlay}
                        />
                        <View style={styles.heroTextBox}>
                            <Text style={styles.heroTitle}>{slide.title}</Text>
                            <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* VACCINES */}
            <Text style={styles.sectionTitle}>💉 Aşı & Parazit Takvimi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {vaccines.length === 0 ? (
                    <EmptyCard text="Henüz kayıtlı aşı yok" />
                ) : (
                    vaccines.map((v, i) => (
                        <View key={i} style={styles.miniCard}>
                            <Text style={{ fontWeight: "900" }}>{v.petName}</Text>
                            <Text>{v.vaccine}</Text>
                            <Text style={{ marginTop: 6, fontWeight: "800" }}>
                                {v.daysLeft < 0
                                    ? `⚠️ ${Math.abs(v.daysLeft)} gün gecikmiş`
                                    : `${v.daysLeft} gün kaldı`}
                            </Text>

                            <TouchableOpacity
                                onPress={() => markDone(v.petId, v.vaccine)}
                                style={styles.doneBtn}
                            >
                                <Text style={{ color: "#fff", fontWeight: "900" }}>✅ Yapıldı</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* PETS */}
            <Text style={styles.sectionTitle}>🐾 Hayvanlarım</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {myPets.length === 0 ? (
                    <EmptyCard text="Henüz hayvan eklemedin" />
                ) : (
                    myPets.map((p) => (
                        <TouchableOpacity
                            key={p.id}
                            onPress={() => navigation.navigate("PetDetails", { petId: p.id })}
                        >
                            <View style={styles.petCard}>
                                <Image source={{ uri: resolvePhoto(p.photoUrl) }} style={styles.petImg} />
                                <Text style={{ fontWeight: "900" }}>{p.name}</Text>
                                <Text style={{ color: "#666" }}>
                                    {p.type || "?"} • {p.breed || "?"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* ADOPTIONS */}
            <Text style={styles.sectionTitle}>🆕 Sahiplendirme</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {adoptions.length === 0 ? (
                    <EmptyCard text="İlan bulunamadı" />
                ) : (
                    adoptions.map((a) => (
                        <TouchableOpacity
                            key={a.id}
                            onPress={() =>
                                navigation.navigate("Adoption", {
                                    screen: "AdoptionDetail",
                                    params: { id: a.id },
                                })
                            }
                        >
                            <View style={styles.adoptCard}>
                                <Image source={{ uri: resolvePhoto(a.photoUrl) }} style={styles.adoptImg} />
                                <Text style={{ fontWeight: "900" }}>{a.name}</Text>
                                <Text style={{ color: "#666" }}>{a.type} • {a.location}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <View style={{ height: 120 }} />
        </ScrollView>
    );
}

/* ================= COMPONENTS ================= */

function EmptyCard({ text }: { text: string }) {
    return (
        <View style={[styles.miniCard, { backgroundColor: "#f2f2f2" }]}>
            <Text style={{ color: "#888", fontWeight: "700" }}>{text}</Text>
        </View>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    welcomeRow: { padding: 16 },
    welcomeText: { fontSize: 26, fontWeight: "900" },
    welcomeSub: { color: "#666", marginTop: 4 },

    heroSlide: { width, height: 280 },
    heroImage: { width: "100%", height: "100%" },
    heroOverlay: { position: "absolute", bottom: 0, width: "100%", height: "60%" },
    heroTextBox: { position: "absolute", bottom: 20, left: 16 },
    heroTitle: { color: "white", fontSize: 26, fontWeight: "900" },
    heroSubtitle: { color: "white" },

    sectionTitle: { fontSize: 18, fontWeight: "900", margin: 16 },

    miniCard: {
        width: 220,
        marginLeft: 16,
        borderRadius: 16,
        padding: 14,
        backgroundColor: "#fff",
    },

    doneBtn: {
        marginTop: 10,
        backgroundColor: colors.primary,
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
    },

    petCard: {
        width: 160,
        marginLeft: 16,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 10,
    },
    petImg: { width: "100%", height: 110, borderRadius: 12 },

    adoptCard: {
        width: 160,
        marginLeft: 16,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 10,
    },
    adoptImg: { width: "100%", height: 110, borderRadius: 12 },
});
