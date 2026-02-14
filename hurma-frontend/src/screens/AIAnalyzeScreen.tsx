import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { analyzeImage } from "../services/aiService"; // ✅ SADECE BURAYI KULLANIYORUZ
import colors from "../theme/colors";

const NO_IMAGE = require("../../assets/no-image.png");

export default function AIAnalyzeScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const { petId, petName } = route.params ?? {};
    const safePetName = petName ?? "Seçilen Hayvan";

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!petId) {
            navigation.replace("AIPetSelect");
        }
    }, [petId]);

    // ================= PICK FROM GALLERY =================
    const pickFromGallery = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
            allowsEditing: true,
        });

        if (res.canceled) return;
        setImageUri(res.assets[0].uri);
    };

    // ================= TAKE PHOTO =================
    const takePhoto = async () => {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("İzin gerekli", "Kamera izni verilmedi");
            return;
        }

        const res = await ImagePicker.launchCameraAsync({
            quality: 0.9,
            allowsEditing: true,
        });

        if (res.canceled) return;
        setImageUri(res.assets[0].uri);
    };

    // ================= ANALYZE =================
    const analyze = async () => {
        if (!imageUri || !petId) {
            Alert.alert("Uyarı", "Önce fotoğraf seçmelisin.");
            return;
        }

        setLoading(true);

        try {
            console.log("➡️ AI ANALYZE START");

            const data = await analyzeImage(imageUri, petId);

            console.log("✅ AI RESULT:", data);

            navigation.navigate("AIResult", {
                petId,
                result: data,
                photoUri: imageUri,
            });
        } catch (e: any) {
            console.error("❌ AI ERROR:", e?.response?.data || e.message);

            Alert.alert(
                "Hata",
                e?.response?.data?.error || e.message || "AI hatası"
            );
        } finally {
            setLoading(false);
        }
    };

    // ================= UI =================
    return (
        <View style={styles.container}>
            <Text style={styles.title}>🧠 AI Sağlık Analizi</Text>

            <View style={styles.petCard}>
                <Text style={styles.petTitle}>🐾 {safePetName}</Text>
                <TouchableOpacity onPress={() => navigation.replace("AIPetSelect")}>
                    <Text style={styles.changePet}>Değiştir</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.imageCard}>
                <Image
                    source={imageUri ? { uri: imageUri } : NO_IMAGE}
                    style={styles.image}
                />
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickBtn} onPress={pickFromGallery}>
                <Text style={styles.pickText}>🖼️ Galeriden Seç</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickBtn} onPress={takePhoto}>
                <Text style={styles.pickText}>📷 Fotoğraf Çek</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.analyzeBtn, loading && { opacity: 0.6 }]}
                onPress={analyze}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.analyzeText}>🤖 ANALİZ ET</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

// ================= STYLES =================

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: colors.background },
    title: {
        fontSize: 24,
        fontWeight: "900",
        marginBottom: 16,
        textAlign: "center",
        color: colors.primary,
    },
    petCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    petTitle: { fontWeight: "900", fontSize: 16 },
    changePet: { color: colors.primary, fontWeight: "900" },
    imageCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    image: { width: "100%", height: 260, borderRadius: 16, backgroundColor: "#eee" },
    pickBtn: {
        backgroundColor: "#ddd",
        padding: 14,
        borderRadius: 14,
        alignItems: "center",
        marginBottom: 10,
    },
    pickText: { fontWeight: "800" },
    analyzeBtn: {
        backgroundColor: "#28a745",
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: "center",
        marginTop: 10,
    },
    analyzeText: { color: "#fff", fontWeight: "900", fontSize: 18 },
});
