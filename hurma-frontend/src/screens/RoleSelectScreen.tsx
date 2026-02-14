import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAuth } from "../context/AuthContext";
import colors from "../theme/colors";

export default function RoleSelectScreen() {
    const { setRole, logout } = useAuth();
    const [loadingRole, setLoadingRole] = useState<null | "USER" | "VET">(null);

    const chooseRole = useCallback(
        async (role: "USER" | "VET") => {
            try {
                setLoadingRole(role);
                await setRole(role); // ✅ backend + local
            } catch (err: any) {
                console.log("SET ROLE ERROR:", err?.response?.data || err.message);

                if (err?.response?.status === 401) {
                    Alert.alert(
                        "Oturum Geçersiz",
                        "Token süresi dolmuş olabilir. Tekrar giriş yapalım.",
                        [{ text: "Tamam", onPress: () => logout() }]
                    );
                    return;
                }

                Alert.alert("Hata", "Rol seçimi kaydedilemedi. Tekrar dene.");
            } finally {
                setLoadingRole(null);
            }
        },
        [setRole, logout]
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sen kimsin?</Text>
            <Text style={styles.subtitle}>Deneyimi sana göre hazırlayalım 🐾</Text>

            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => chooseRole("USER")}
                disabled={!!loadingRole}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>👤 Pet Sahibi</Text>
                    {loadingRole === "USER" ? <ActivityIndicator /> : null}
                </View>
                <Text style={styles.cardText}>
                    Petin için veteriner bul, analiz yap, ürünleri keşfet, randevu al.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => chooseRole("VET")}
                disabled={!!loadingRole}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>🩺 Veteriner</Text>
                    {loadingRole === "VET" ? <ActivityIndicator /> : null}
                </View>
                <Text style={styles.cardText}>
                    Gelen talepleri gör, sohbetleri yönet, hasta/pet sahiplerine destek ol.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.85}>
                <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 24,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "900",
        color: colors.text,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: colors.muted,
        marginBottom: 18,
    },
    card: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 18,
        padding: 16,
        marginTop: 12,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.text,
    },
    cardText: {
        color: colors.muted,
        fontSize: 13,
        lineHeight: 18,
    },
    logoutBtn: {
        marginTop: 20,
        alignSelf: "center",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    logoutText: {
        color: colors.muted,
        fontWeight: "700",
    },
});

