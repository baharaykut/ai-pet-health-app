import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../services/api";
import cartService, { CartItem } from "../services/cartService";

/* ================= ICON MOCK ================= */

const Icon = ({ name, size = 24, color = "#000" }: {
    name: string; size?: number; color?: string;
}) => {
    const iconMap: Record<string, string> = {
        "arrow-back": "←",
        "trash": "🗑️",
        "remove": "-",
        "add": "+",
        "shopping-cart": "🛒",
    };
    return (
        <Text style={{ fontSize: size, color, textAlign: "center", lineHeight: size }}>
            {iconMap[name] || "•"}
        </Text>
    );
};

/* ================= IMAGE RESOLVER ================= */

const FALLBACK_IMAGE = "https://cdn-icons-png.flaticon.com/512/1170/1170576.png";

function resolveImage(photoUrl?: string | null) {
    if (!photoUrl) return { uri: FALLBACK_IMAGE };
    if (photoUrl.startsWith("http")) return { uri: photoUrl };
    const base = api.defaults.baseURL || "";
    return { uri: `${base}${photoUrl}` };
}

/* ================= SCREEN ================= */

export default function CartScreen({ navigation }: any) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    const hydrate = useCallback(async () => {
        try {
            setLoading(true);
            const items = await cartService.getCart();
            setCartItems(Array.isArray(items) ? items : []);
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data ?? e?.message ?? "Sepet alınamadı");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { hydrate(); }, [hydrate]);
    useFocusEffect(useCallback(() => { hydrate(); }, [hydrate]));

    /* ================= CALCULATIONS ================= */

    const { subtotal, tax, shipping, total } = useMemo(() => {
        const sub = cartItems.reduce(
            (s, i) => s + i.product.price * i.quantity,
            0
        );
        const taxCalc = sub * 0.08;
        const ship = sub >= 150 || sub === 0 ? 0 : 9.99;
        const tot = sub + taxCalc + ship;

        return {
            subtotal: sub,
            tax: taxCalc,
            shipping: ship,
            total: tot,
        };
    }, [cartItems]);

    /* ================= ACTIONS ================= */

    const updateQuantity = async (cartItemId: number, newQty: number) => {
        try {
            if (newQty < 1) {
                await cartService.removeItem(cartItemId);
            } else {
                await cartService.updateQty(cartItemId, newQty);
            }
            await hydrate();
        } catch (e: any) {
            Alert.alert("Hata", e?.response?.data ?? e?.message ?? "Güncellenemedi");
        }
    };

    const removeItem = (cartItemId: number) => {
        Alert.alert("Ürünü Sil", "Bu ürünü silmek istiyor musunuz?", [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil", style: "destructive",
                onPress: async () => {
                    try {
                        await cartService.removeItem(cartItemId);
                        await hydrate();
                    } catch {
                        Alert.alert("Hata", "Silinemedi");
                    }
                }
            }
        ]);
    };

    const clearCart = async () => {
        try {
            await cartService.clear();
            await hydrate();
            Alert.alert("Başarılı", "Sepet temizlendi");
        } catch {
            Alert.alert("Hata", "Sepet temizlenemedi");
        }
    };

    /* ================= RENDER ITEM ================= */

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <Image source={resolveImage(item.product.photoUrl)} style={styles.itemImage} />


            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemPrice}>{item.product.price.toFixed(2)} ₺</Text>

                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                        <Icon name="remove" size={18} color="#666" />
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{item.quantity}</Text>

                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                        <Icon name="add" size={18} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.itemRight}>
                <Text style={styles.itemTotal}>
                    {(item.product.price * item.quantity).toFixed(2)} ₺
                </Text>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Icon name="trash" size={20} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        </View>
    );

    /* ================= UI ================= */

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sepetim</Text>
                <TouchableOpacity onPress={clearCart}>
                    <Text style={{ color: "#FF3B30" }}>Temizle</Text>
                </TouchableOpacity>
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="shopping-cart" size={80} color="#DDD" />
                    <Text style={styles.emptyTitle}>Sepetiniz Boş</Text>
                </View>
            ) : (
                <ScrollView style={styles.content}>
                    <FlatList
                        data={cartItems}
                        renderItem={renderCartItem}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                    />

                    <View style={styles.summary}>
                        <Text>Ara Toplam: {subtotal.toFixed(2)} ₺</Text>
                        <Text>KDV: {tax.toFixed(2)} ₺</Text>
                        <Text>Kargo: {shipping.toFixed(2)} ₺</Text>
                        <Text style={{ fontWeight: "bold", marginTop: 8 }}>
                            Toplam: {total.toFixed(2)} ₺
                        </Text>

                        <TouchableOpacity
                            style={styles.checkoutBtn}
                            onPress={() => navigation.navigate("Checkout")}
                        >
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>
                                Siparişi Tamamla
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: { flexDirection: "row", justifyContent: "space-between", padding: 16, backgroundColor: "#fff" },
    headerTitle: { fontSize: 18, fontWeight: "bold" },

    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyTitle: { fontSize: 20, color: "#666", marginTop: 12 },

    content: { padding: 16 },

    cartItem: { flexDirection: "row", marginBottom: 12, backgroundColor: "#fff", padding: 10, borderRadius: 8 },
    itemImage: { width: 70, height: 70, borderRadius: 8, marginRight: 10 },
    itemInfo: { flex: 1 },
    itemName: { fontWeight: "bold" },
    itemPrice: { color: "#FF3B30", marginTop: 4 },

    quantityContainer: { flexDirection: "row", alignItems: "center", marginTop: 6 },
    quantityButton: { padding: 6 },
    quantityText: { marginHorizontal: 10, fontWeight: "bold" },

    itemRight: { justifyContent: "space-between", alignItems: "flex-end" },
    itemTotal: { fontWeight: "bold" },

    summary: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginTop: 12 },

    checkoutBtn: {
        marginTop: 12,
        backgroundColor: "#4CAF50",
        padding: 14,
        borderRadius: 8,
        alignItems: "center"
    }
});
