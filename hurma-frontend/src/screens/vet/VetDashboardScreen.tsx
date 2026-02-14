import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { acceptVetRequest, fetchVetRequests, VetRequestDto } from "../../services/vetRequests";
import colors from "../../theme/colors";

const TEMP_VET_ID = 1; // ✅ şimdilik sabit. sonra JWT/DB ile otomatik yaparız.

export default function VetDashboardScreen() {
    const navigation = useNavigation<any>();

    const [items, setItems] = useState<VetRequestDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const pending = useMemo(() => items.filter(x => !x.isAccepted), [items]);
    const accepted = useMemo(() => items.filter(x => x.isAccepted), [items]);

    const load = useCallback(async () => {
        try {
            const data = await fetchVetRequests(TEMP_VET_ID);
            setItems(data);
        } catch (e: any) {
            console.log("VetDashboard load error:", e?.response?.data || e?.message);
            Alert.alert("Hata", "Talepler alınamadı. Backend çalışıyor mu kontrol et.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const onAccept = async (req: VetRequestDto) => {
        try {
            await acceptVetRequest(req.id);
            // UI güncelle
            setItems(prev => prev.map(x => (x.id === req.id ? { ...x, isAccepted: true } : x)));
            Alert.alert("Başarılı", "Talep kabul edildi ✅");

            // Kabul edince direkt chat'e geç
            navigation.navigate("VetChat", {
                userId: req.userId,
                userName: `User #${req.userId}`,
            });
        } catch (e: any) {
            console.log("Accept error:", e?.response?.data || e?.message);
            Alert.alert("Hata", "Kabul işlemi başarısız.");
        }
    };

    const renderCard = (req: VetRequestDto) => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Kullanıcı: #{req.userId}</Text>
            <Text style={styles.question}>{req.question}</Text>
            <Text style={styles.date}>🕒 {new Date(req.createdAt).toLocaleString()}</Text>

            {!req.isAccepted ? (
                <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(req)}>
                    <Text style={styles.acceptBtnText}>Kabul Et</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={() =>
                        navigation.navigate("VetChat", {
                            userId: req.userId,
                            userName: `User #${req.userId}`,
                        })
                    }
                >
                    <Text style={styles.chatBtnText}>Sohbete Git</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
                <Text style={{ marginTop: 10, color: colors.text }}>Talepler yükleniyor…</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>🩺 Vet Dashboard</Text>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Bekleyen Talepler ({pending.length})</Text>
            </View>

            <FlatList
                data={pending}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => renderCard(item)}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            load();
                        }}
                    />
                }
                ListEmptyComponent={
                    <Text style={styles.empty}>Bekleyen talep yok ✅</Text>
                }
            />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Kabul Edilenler ({accepted.length})</Text>
            </View>

            <FlatList
                data={accepted}
                keyExtractor={(item) => `acc-${item.id}`}
                renderItem={({ item }) => renderCard(item)}
                ListEmptyComponent={<Text style={styles.empty}>Henüz kabul edilen yok.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
    header: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 12 },
    sectionHeader: { marginTop: 14, marginBottom: 8 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
    empty: { color: colors.muted, textAlign: "center", marginVertical: 10 },

    card: {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },
    cardTitle: { fontWeight: "800", color: colors.text, marginBottom: 6 },
    question: { color: colors.text, marginBottom: 8, lineHeight: 20 },
    date: { color: colors.muted, fontSize: 12, marginBottom: 10 },

    acceptBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
    acceptBtnText: { color: "#fff", fontWeight: "800" },

    chatBtn: { backgroundColor: "#2E7D32", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
    chatBtnText: { color: "#fff", fontWeight: "800" },
});
