import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import api from "../services/api";
import cartService from "../services/cartService";

// ================= TYPES =================
interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    photoUrl: string;
    stock: number;
    rating: number;
    reviewCount: number;
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

// ================= SCREEN =================
export default function ProductsScreen({ navigation }: any) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [addingId, setAddingId] = useState<number | null>(null);
    const [cartCount, setCartCount] = useState(0);

    // ================= LOAD PRODUCTS =================
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/products", {
                params: search ? { search } : undefined,
            });
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch {
            Alert.alert("Hata", "Ürünler yüklenemedi");
        } finally {
            setLoading(false);
        }
    }, [search]);

    // ================= LOAD CART COUNT =================
    const loadCartCount = async () => {
        try {
            const items = await cartService.getCart();
            const total = items.reduce(
                (s: number, i: { quantity: number }) => s + i.quantity,
                0
            );
            setCartCount(total);
        } catch {
            setCartCount(0);
        }
    };

    useEffect(() => {
        loadProducts();
        loadCartCount();
    }, [loadProducts]);

    useFocusEffect(
        useCallback(() => {
            loadCartCount();
        }, [])
    );

    // ================= ADD TO CART =================
    const addToCart = async (product: Product) => {
        if (addingId === product.id) return;

        try {
            setAddingId(product.id);
            await cartService.addToCart(product.id, 1);
            await loadCartCount();
            Alert.alert("✅ Sepete Eklendi", product.name);
        } catch {
            Alert.alert("❌ Hata", "Sepete eklenemedi");
        } finally {
            setAddingId(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* 🔍 SEARCH BAR */}
            <View style={styles.searchBar}>
                <TextInput
                    placeholder="Ürün ara..."
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={loadProducts}
                    style={styles.searchInput}
                />
                <TouchableOpacity onPress={loadProducts} style={styles.searchBtn}>
                    <Text style={{ color: "#FFF" }}>Ara</Text>
                </TouchableOpacity>
            </View>

            {/* 🧱 PRODUCT GRID */}
            <FlatList
                data={products}
                numColumns={2}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 8, paddingBottom: 200 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate("ProductDetails", { product: item })
                        }
                    >
                        {item.originalPrice && item.originalPrice > item.price && (
                            <View style={styles.discountBadge}>
                                <Text style={{ color: "#FFF", fontSize: 12 }}>
                                    İNDİRİM
                                </Text>
                            </View>
                        )}

                        <Image
                            source={resolveImage(item.photoUrl)}
                            style={styles.image}
                            resizeMode="contain"
                        />

                        <Text numberOfLines={2} style={styles.name}>
                            {item.name}
                        </Text>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={styles.price}>
                                {item.price.toFixed(2)} ₺
                            </Text>
                            {item.originalPrice && (
                                <Text style={styles.oldPrice}>
                                    {item.originalPrice.toFixed(2)} ₺
                                </Text>
                            )}
                        </View>

                        <Text style={styles.rating}>
                            ⭐ {item.rating} ({item.reviewCount})
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.addBtn,
                                (item.stock <= 0 || addingId === item.id) && {
                                    backgroundColor: "#999",
                                },
                            ]}
                            disabled={item.stock <= 0 || addingId === item.id}
                            onPress={() => addToCart(item)}
                        >
                            <Text style={{ color: "#FFF", fontWeight: "bold" }}>
                                {item.stock <= 0
                                    ? "Tükendi"
                                    : addingId === item.id
                                        ? "Ekleniyor..."
                                        : "Sepete Ekle"}
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />

            {/* 🛒 FLOATING CART BUTTON */}
            <TouchableOpacity
                style={styles.floatingCart}
                onPress={() => navigation.navigate("Cart")}
                activeOpacity={0.85}
            >
                <Text style={{ fontSize: 26, color: "#fff" }}>🛒</Text>

                {cartCount > 0 && (
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{cartCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
}

// ================= STYLES =================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F5" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    searchBar: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#FFF",
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    searchBtn: {
        marginLeft: 8,
        backgroundColor: "#4CAF50",
        paddingHorizontal: 16,
        justifyContent: "center",
        borderRadius: 8,
    },

    card: {
        flex: 1,
        backgroundColor: "#FFF",
        margin: 6,
        borderRadius: 12,
        padding: 10,
        elevation: 3,
    },
    image: {
        width: "100%",
        height: 130,
        borderRadius: 10,
        backgroundColor: "#F2F2F2",
    },
    name: { fontWeight: "bold", marginTop: 6, fontSize: 14 },
    price: { color: "red", fontSize: 16, fontWeight: "bold" },
    oldPrice: {
        marginLeft: 6,
        color: "#999",
        textDecorationLine: "line-through",
    },
    rating: { color: "#444", marginVertical: 4, fontSize: 12 },

    addBtn: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 6,
    },

    discountBadge: {
        position: "absolute",
        zIndex: 10,
        top: 8,
        left: 8,
        backgroundColor: "red",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },

    floatingCart: {
        position: "absolute",
        right: 16,
        bottom: 95,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#FF9800",
        justifyContent: "center",
        alignItems: "center",
        elevation: 10,
    },

    cartBadge: {
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "red",
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
    },

    cartBadgeText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 12,
    },
});
