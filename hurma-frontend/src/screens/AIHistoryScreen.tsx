import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import colors from "../theme/colors";

/* ================= TYPES ================= */

type AiAnalyzeResult = {
    id?: number;
    analysisId?: number;
    title: string;
    summary: string;
    status: string;
    confidence: number;
    createdAt?: string;
    petId?: number;
    pet?: {
        id: number;
        name: string;
    };
};

/* ================= CONFIG ================= */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/* ================= HELPERS ================= */

function formatPct(value: number) {
    const v = Number(value) || 0;
    const pct = v <= 1 ? v * 100 : v;
    return `${pct.toFixed(1)}`;
}

/* ================= SPARKLINE ================= */

function Sparkline({
    values,
    width,
    height,
}: {
    values: number[];
    width: number;
    height: number;
}) {
    const padding = 10;
    const innerW = Math.max(1, width - padding * 2);
    const innerH = Math.max(1, height - padding * 2);

    const safeValues = values.length > 0 ? values : [0];

    const minV = Math.min(...safeValues);
    const maxV = Math.max(...safeValues);
    const denom = maxV - minV === 0 ? 1 : maxV - minV;

    const points = safeValues.map((v, i) => {
        const x =
            safeValues.length === 1
                ? innerW / 2
                : (i / (safeValues.length - 1)) * innerW;

        const y = (1 - (v - minV) / denom) * innerH;

        return { x: x + padding, y: y + padding };
    });

    const segments = [];
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        segments.push(
            <View
                key={`seg-${i}`}
                style={[
                    styles.sparkSeg,
                    {
                        left: p1.x,
                        top: p1.y,
                        width: length,
                        transform: [{ rotate: `${angle}deg` }],
                    },
                ]}
            />
        );
    }

    return (
        <View style={[styles.sparkWrap, { width, height }]}>
            <View style={[styles.sparkGridLine, { top: height * 0.25 }]} />
            <View style={[styles.sparkGridLine, { top: height * 0.5 }]} />
            <View style={[styles.sparkGridLine, { top: height * 0.75 }]} />

            {segments}

            {points.map((p, i) => (
                <View
                    key={`dot-${i}`}
                    style={[
                        styles.sparkDot,
                        {
                            left: p.x - 4,
                            top: p.y - 4,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

/* ================= SCREEN ================= */

export default function AIHistoryScreen() {
    const navigation = useNavigation<any>();

    const [list, setList] = useState<AiAnalyzeResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const loadHistory = async () => {
        try {
            setLoading(true);
            setErrorText(null);

            if (!API_BASE_URL) {
                setErrorText("❌ API URL bulunamadı");
                return;
            }

            const token = await AsyncStorage.getItem("auth_token");
            if (!token) {
                setErrorText("❌ Oturum bulunamadı.");
                return;
            }

            const url = `${API_BASE_URL}/api/Ai/mine`;
            console.log("📜 AI HISTORY GET:", url);

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            console.log("📜 AI HISTORY RAW:", data);

            const finalList = Array.isArray(data) ? data : [];
            setList(finalList);
        } catch (err: any) {
            console.error("AI HISTORY ERROR:", err);
            setErrorText("❌ Geçmiş alınamadı");
        } finally {
            setLoading(false);
        }
    };

    const chartData = useMemo(() => list.slice(0, 5).reverse(), [list]);

    const sparkValues = useMemo(() => {
        return chartData.map((item) => {
            const v = Number(item.confidence) || 0;
            return v <= 1 ? v * 100 : v;
        });
    }, [chartData]);

    const screenW = Dimensions.get("window").width;

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Yükleniyor...</Text>
            </View>
        );
    }

    if (errorText) {
        return (
            <View style={styles.center}>
                <Text>{errorText}</Text>
            </View>
        );
    }

    return (
        <FlatList
            ListHeaderComponent={
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>📈 Son AI Analiz Trendi</Text>

                    <View style={styles.chartCard}>
                        <Sparkline
                            values={sparkValues}
                            width={screenW - 32}
                            height={180}
                        />
                    </View>
                </View>
            }
            data={list}
            keyExtractor={(item, index) =>
                (item.id ?? item.analysisId ?? index).toString()
            }
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item, index }) => {
                const analysisId = item.id ?? item.analysisId;
                const petName =
                    item.pet?.name ??
                    (item.petId ? `Pet #${item.petId}` : "Bilinmeyen Hayvan");

                return (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("HealthAI", {
                                screen: "AIHistoryDetail",
                                params: { analysisId: analysisId },
                            })
                        }
                    >
                        <View style={[styles.card, index === 0 && styles.latestCard]}>
                            <Text style={styles.title}>{item.title}</Text>

                            <Text style={{ fontWeight: "700", marginBottom: 4 }}>
                                🐾 {petName}
                            </Text>

                            <Text style={styles.summary} numberOfLines={2}>
                                {item.summary}
                            </Text>

                            <View style={styles.row}>
                                <Text style={styles.status}>{item.status}</Text>
                                <Text style={styles.confidence}>
                                    %{formatPct(item.confidence)}
                                </Text>
                            </View>

                            {index === 0 && (
                                <Text style={styles.latestBadge}>⭐ SON ANALİZ</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            }}
        />
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },

    chartContainer: { marginBottom: 20 },
    chartTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },

    chartCard: {
        backgroundColor: colors.cardAlt,
        borderRadius: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },

    sparkWrap: { borderRadius: 16, overflow: "hidden", position: "relative" },
    sparkGridLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        opacity: 0.15,
        backgroundColor: colors.muted,
    },
    sparkSeg: { position: "absolute", height: 2, backgroundColor: colors.primary },
    sparkDot: {
        position: "absolute",
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: colors.primary,
    },

    card: {
        backgroundColor: colors.card,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    latestCard: { borderColor: colors.primary, borderWidth: 2 },

    title: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
    summary: { fontSize: 13, color: colors.muted, marginBottom: 10 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    status: { fontSize: 12, fontWeight: "700", color: colors.primary },
    confidence: { fontSize: 12, fontWeight: "700", color: colors.primary },
    latestBadge: { marginTop: 6, fontSize: 11, fontWeight: "700", color: colors.primary },
});
