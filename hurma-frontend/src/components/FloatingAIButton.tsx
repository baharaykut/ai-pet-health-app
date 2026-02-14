import { Ionicons } from "@expo/vector-icons";
import { useNavigationState } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { navigate } from "../navigation/navigationRef";
import colors from "../theme/colors";

const HIDDEN_ROUTES = new Set(["Login", "Register", "Onboarding"]);

export default function FloatingAIButton() {
    const pulse = useRef(new Animated.Value(0)).current;
    const [menuOpen, setMenuOpen] = useState(false);

    const routeName = useNavigationState((state) => {
        const r = state?.routes?.[state.index ?? 0];
        return (r?.name as string) ?? null;
    });

    const isHidden = useMemo(() => (routeName ? HIDDEN_ROUTES.has(routeName) : true), [routeName]);
    if (isHidden) return null;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: false }),
                Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: false }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [pulse]);

    const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
    const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] });

    return (
        <View style={styles.container} pointerEvents="box-none">
            {menuOpen && (
                <View style={styles.menu}>
                    <MenuItem icon="add-circle-outline" label="Yeni Analiz" onPress={() => navigate("AIPetSelect" as never)} />
                    <MenuItem icon="time-outline" label="AI Geçmişi" onPress={() => navigate("AIHistory" as never)} />
                </View>
            )}

            <Animated.View style={[styles.halo, { transform: [{ scale }], opacity }]} />

            <LinearGradient colors={["#ff8a00", "#ff3d71", "#7c3aed"]} style={styles.gradient}>
                <Pressable
                    style={styles.button}
                    onPress={() => navigate("AIPetSelect" as never)}
                    onLongPress={() => setMenuOpen((p) => !p)}
                >
                    <Ionicons name="scan" size={26} color="#fff" />
                    <Text style={styles.btnText}>AI</Text>
                </Pressable>
            </LinearGradient>
        </View>
    );
}

function MenuItem({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
    return (
        <Pressable style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon} size={20} color={colors.primary} />
            <Text style={styles.menuText}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    // ✅ SADECE BUTONUN OLDUĞU KÖŞE
    container: {
        position: "absolute",
        right: 20,
        bottom: 20,
        zIndex: 9999,
        pointerEvents: "box-none",
    },

    halo: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 78,
        height: 78,
        borderRadius: 100,
        backgroundColor: "#ff8a00",
    },

    gradient: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 68,
        height: 68,
        borderRadius: 50,
        padding: 3,
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
            android: { elevation: 12 },
            web: { boxShadow: "0 4px 15px rgba(0,0,0,0.25)" } as any,
        }),
    },

    button: {
        flex: 1,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },

    btnText: { color: "#fff", fontSize: 10, fontWeight: "800", marginTop: -2 },

    menu: {
        position: "absolute",
        right: 0,
        bottom: 85,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        gap: 10,
        ...Platform.select({
            ios: { shadowOpacity: 0.3, shadowRadius: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 } },
            android: { elevation: 10 },
            web: { boxShadow: "0 4px 12px rgba(0,0,0,0.18)" } as any,
        }),
    },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
    },

    menuText: { fontWeight: "700", fontSize: 14, color: colors.text },
});
