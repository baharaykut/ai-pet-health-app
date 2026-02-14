import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { usePets } from "../context/PetContext";
import { HealthAIStackParamList } from "../navigation/HealthAIStack";
import colors from "../theme/colors";

// ✅ DOĞRU STACK TYPE
type NavProp = NativeStackNavigationProp<HealthAIStackParamList, "AIPetSelect">;

export default function AIPetSelectScreen() {
    const navigation = useNavigation<NavProp>();
    const { pets } = usePets();

    const [selectedPet, setSelectedPet] = useState<any>(null);

    console.log("📌 AIPetSelect AÇILDI");

    /* 🧠 PET VAR MI? */
    const hasPets = useMemo(
        () => Array.isArray(pets) && pets.length > 0,
        [pets]
    );

    /* ▶️ AI ANALİZE GİT */
    const startAnalyze = () => {
        if (!selectedPet) return;

        console.log("🚀 NAVIGATE Analyze ÇAĞRILDI:", selectedPet);

        navigation.navigate("Analyze", {
            petId: selectedPet.id,
            petName: selectedPet.name,
        });
    };

    /* ❌ PET YOKSA */
    if (!hasPets) {
        return (
            <View style={styles.container}>
                <Ionicons
                    name="alert-circle-outline"
                    size={42}
                    color={colors.muted}
                />
                <Text style={styles.emptyTitle}>Henüz Pet Eklenmemiş</Text>
                <Text style={styles.emptyText}>
                    AI tarama yapabilmek için önce bir pet eklemelisin.
                </Text>

                <TouchableOpacity
                    style={styles.addPetBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.addPetText}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>AI Tarama için Pet Seç</Text>

            {/* 🐾 LİSTE */}
            <FlatList
                data={pets}
                keyExtractor={(item: any) => String(item.id)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 220 }} // 👈 BUTON İÇİN BOŞLUK
                renderItem={({ item }: any) => {
                    const active = selectedPet?.id === item.id;

                    return (
                        <TouchableOpacity
                            style={[styles.row, active && styles.activeRow]}
                            onPress={() => setSelectedPet(item)}
                        >
                            <Ionicons
                                name="paw"
                                size={20}
                                color={active ? colors.primary : colors.muted}
                            />

                            <Text style={styles.name}>{item.name}</Text>

                            {active && (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={22}
                                    color={colors.primary}
                                />
                            )}
                        </TouchableOpacity>
                    );
                }}
            />

            {/* ✅ SABİT ALT BUTON (TAB BAR ÜSTÜNDE) */}
            <TouchableOpacity
                style={[
                    styles.startBtn,
                    !selectedPet && { opacity: 0.5 },
                ]}
                disabled={!selectedPet}
                onPress={startAnalyze}
                activeOpacity={0.8}
            >
                <Text style={styles.startText}>🤖 AI Taramayı Başlat</Text>
            </TouchableOpacity>
        </View>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    title: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 16,
        color: colors.text,
        textAlign: "center",
        marginTop: 20,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        marginHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        backgroundColor: colors.card,
        gap: 12,
    },

    activeRow: {
        borderColor: colors.primary,
        backgroundColor: "#fff",
    },

    name: {
        flex: 1,
        fontWeight: "700",
        color: colors.text,
    },

    // ✅ EN KRİTİK YER BURASI
    startBtn: {
        position: "absolute",
        bottom: 100, // 👈 TAB BAR'IN ÜSTÜ
        left: 20,
        right: 20,
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: "center",
        elevation: 10,
    },

    startText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 16,
    },

    /* EMPTY STATE */
    emptyTitle: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: "800",
        color: colors.text,
    },

    emptyText: {
        fontSize: 13,
        color: colors.muted,
        marginVertical: 8,
        textAlign: "center",
    },

    addPetBtn: {
        marginTop: 16,
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
    },

    addPetText: {
        color: "#fff",
        fontWeight: "800",
    },
});
