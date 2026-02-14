import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Text,
    View,
} from "react-native";
import api from "../services/api";
import { Order, orderService } from "../services/orderService";

// ================= IMAGE RESOLVER =================
const FALLBACK_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/1170/1170576.png";

function resolveImage(photoUrl?: string | null) {
    if (!photoUrl) return { uri: FALLBACK_IMAGE };
    if (photoUrl.startsWith("http")) return { uri: photoUrl };

    const base = api.defaults.baseURL || "";
    return { uri: `${base}${photoUrl}` };
}

export default function OrderDetailScreen({ route }: any) {
    const { orderId } = route.params;

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);

    const load = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderById(orderId);
            setOrder(data);
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data ?? e.message ?? "Sipariş alınamadı");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [orderId]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator />
                <Text style={{ marginTop: 10 }}>Sipariş yükleniyor...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Sipariş bulunamadı.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: "#f5f5f5" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Sipariş Detayı</Text>

            <Text style={{ marginTop: 6 }}>Sipariş No: {order.id}</Text>
            <Text>Tarih: {order.createdAt}</Text>

            <Text style={{ fontWeight: "bold", marginTop: 6 }}>
                Toplam: {order.total.toFixed(2)} ₺
            </Text>

            {/* ============ ADDRESS ============ */}
            <Text style={{ marginTop: 12, fontWeight: "bold" }}>📦 Teslimat Adresi</Text>
            <Text>{order.address.title} • {order.address.fullName}</Text>
            <Text>{order.address.city} / {order.address.district}</Text>
            <Text>{order.address.detail}</Text>

            {/* ============ ITEMS ============ */}
            <Text style={{ marginTop: 12, fontWeight: "bold" }}>🧩 Ürünler</Text>

            <FlatList
                style={{ marginTop: 8 }}
                data={order.items}
                keyExtractor={(i) => `${i.productId}`}
                renderItem={({ item }) => (
                    <View
                        style={{
                            flexDirection: "row",
                            marginBottom: 12,
                            backgroundColor: "#fff",
                            padding: 10,
                            borderRadius: 10,
                            alignItems: "center",
                        }}
                    >
                        <Image
                            source={resolveImage(item.photoUrl)}
                            style={{ width: 60, height: 60, borderRadius: 8, marginRight: 10 }}
                        />

                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                            <Text>
                                {item.quantity} x {item.unitPrice.toFixed(2)} ₺
                            </Text>
                        </View>

                        <Text style={{ fontWeight: "bold" }}>
                            {(item.quantity * item.unitPrice).toFixed(2)} ₺
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}
