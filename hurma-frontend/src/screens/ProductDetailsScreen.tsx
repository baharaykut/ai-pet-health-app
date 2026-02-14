import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../services/api";
import cartService from "../services/cartService";

// ================= IMAGE RESOLVER =================
const FALLBACK_IMAGE =
    "https://cdn-icons-png.flaticon.com/512/1170/1170576.png";

function joinUrl(base: string, path: string) {
    if (!base) return path;
    if (!path) return base;
    if (base.endsWith("/") && path.startsWith("/")) return base + path.substring(1);
    if (!base.endsWith("/") && !path.startsWith("/")) return base + "/" + path;
    return base + path;
}

function resolveImage(photoUrl?: string | null) {
    if (!photoUrl) return { uri: FALLBACK_IMAGE };
    if (photoUrl.startsWith("http")) return { uri: photoUrl };

    const base = api.defaults.baseURL || "";
    return { uri: joinUrl(base, photoUrl) };
}

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
    deliveryTime?: string;
}

// ================= SCREEN =================
export default function ProductDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const { product } = route.params as { product: Product };

    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!product) {
        return (
            <View style={styles.center}>
                <Text>Ürün bulunamadı</Text>
            </View>
        );
    }

    const addToCart = async () => {
        if (product.stock <= 0) {
            Alert.alert("❌ Stok Yok", "Bu ürün tükenmiş.");
            return;
        }

        if (loading) return;

        try {
            setLoading(true);
            await cartService.addToCart(product.id, 1);
            Alert.alert("✅ Başarılı", "Ürün sepete eklendi");
        } catch (e: any) {
            console.log("❌ ADD TO CART ERROR:", e?.response?.data || e.message);

            if (e?.response?.status === 401) {
                Alert.alert("Giriş Gerekli", "Sepete eklemek için giriş yapmalısın.");
                return;
            }

            Alert.alert("❌ Hata", e?.response?.data || "Sepete eklenemedi");
        } finally {
            setLoading(false);
        }
    };

    const imageSource = imageError
        ? { uri: FALLBACK_IMAGE }
        : resolveImage(product.photoUrl);

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>← Geri</Text>
            </TouchableOpacity>

            {/* 🖼️ IMAGE */}
            <Image
                source={imageSource}
                style={styles.image}
                resizeMode="contain"
                onError={() => setImageError(true)}
            />

            <Text style={styles.name}>{product.name}</Text>

            <Text style={styles.price}>{product.price.toFixed(2)} ₺</Text>

            {product.originalPrice && product.originalPrice > product.price && (
                <Text style={styles.oldPrice}>
                    {product.originalPrice.toFixed(2)} ₺
                </Text>
            )}

            <Text style={styles.desc}>{product.description}</Text>

            <View style={styles.infoBox}>
                <Text>📦 Stok: {product.stock}</Text>
                <Text>⭐ Puan: {product.rating} ({product.reviewCount})</Text>
                <Text>🚚 Teslimat: {product.deliveryTime ?? "2-4 iş günü"}</Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.addBtn,
                    (product.stock <= 0 || loading) && { backgroundColor: "#999" },
                ]}
                disabled={product.stock <= 0 || loading}
                onPress={addToCart}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        {product.stock > 0 ? "Sepete Ekle" : "Tükendi"}
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

// ================= STYLES =================
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    image: {
        width: "100%",
        height: 260,
        borderRadius: 16,
        marginBottom: 12,
        backgroundColor: "#F2F2F2",
    },
    name: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
    price: { fontSize: 22, fontWeight: "bold", color: "red" },
    oldPrice: {
        fontSize: 16,
        textDecorationLine: "line-through",
        color: "#999",
    },
    desc: { marginTop: 10, fontSize: 14, lineHeight: 20 },
    infoBox: {
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#F5F5F5",
        gap: 6,
    },
    addBtn: {
        marginTop: 20,
        backgroundColor: "#4CAF50",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
});
