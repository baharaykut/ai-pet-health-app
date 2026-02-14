import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import api from "../services/api";
import { Order, orderService } from "../services/orderService";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ================= IMAGE RESOLVER =================
const FALLBACK_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/1170/1170576.png";

function resolveImage(photoUrl?: string | null) {
    if (!photoUrl) return { uri: FALLBACK_IMAGE };
    if (photoUrl.startsWith("http")) return { uri: photoUrl };

    const base = api.defaults.baseURL || "";
    return { uri: `${base}${photoUrl}` };
}

export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            setLoading(true);
            const list = await orderService.getOrders();
            setOrders(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error("❌ ORDERS LOAD ERROR:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const toggleExpand = (id: number) => {
        LayoutAnimation.easeInEaseOut();
        setExpanded(expanded === id ? null : id);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#ff8800" />
                <Text>Siparişler yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🧾 Siparişlerim</Text>

            {orders.length === 0 ? (
                <Text style={styles.emptyText}>Henüz bir siparişiniz yok 🐾</Text>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        const isOpen = expanded === item.id;

                        return (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => toggleExpand(item.id)}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.date}>📅 {item.createdAt}</Text>
                                <Text style={styles.total}>
                                    💰 {item.total.toFixed(2)} ₺
                                </Text>

                                {isOpen && (
                                    <View style={styles.details}>
                                        <Text style={styles.detailsTitle}>
                                            🧩 Ürünler ({item.items.length}):
                                        </Text>

                                        {item.items.map((i, idx) => (
                                            <View key={idx} style={styles.itemRow}>
                                                <Image
                                                    source={resolveImage(i.photoUrl)}
                                                    style={styles.image}
                                                />

                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.itemName}>
                                                        {i.name}
                                                    </Text>
                                                    <Text style={styles.itemPrice}>
                                                        {i.unitPrice.toFixed(2)} ₺ x {i.quantity}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9f9fb", padding: 16 },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 16,
        color: "#222",
        textAlign: "center",
    },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyText: { textAlign: "center", fontSize: 16, color: "#555" },

    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        elevation: 3,
    },

    date: { fontSize: 14, color: "#777" },
    total: { fontSize: 16, fontWeight: "bold", color: "#ff8800", marginTop: 4 },

    details: {
        marginTop: 10,
        backgroundColor: "#fff8e1",
        padding: 10,
        borderRadius: 8,
    },
    detailsTitle: { fontWeight: "bold", marginBottom: 6, color: "#333" },

    itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    image: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
    itemName: { fontSize: 15, fontWeight: "600" },
    itemPrice: { fontSize: 13, color: "#ff8800" },
});
