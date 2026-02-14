import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { usePets } from "../context/PetContext";
import colors from "../theme/colors";

export default function HealthAIScreen({ navigation }: any) {
    const route = useRoute<any>();
    const { petId } = route.params || {};

    const { saveAIResultToPet } = usePets();

    const [media, setMedia] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [imageSource, setImageSource] = useState<"camera" | "gallery">("gallery");

    /* ---------------- KAMERA İZİN KONTROLÜ ---------------- */
    const requestCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === "granted";
    };

    const requestGalleryPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === "granted";
    };

    /* ---------------- KAMERA İLE ÇEK ---------------- */
    const takePhoto = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert("İzin Gerekli", "Kamera kullanmak için izin vermelisiniz.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setMedia(result.assets[0]);
            setModalVisible(false);
            analyzeWithBackend(result.assets[0].uri);
        }
    };

    /* ---------------- GALERİDEN SEÇ ---------------- */
    const pickFromGallery = async () => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) {
            Alert.alert("İzin Gerekli", "Galeriye erişmek için izin vermelisiniz.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setMedia(result.assets[0]);
            setModalVisible(false);
            analyzeWithBackend(result.assets[0].uri);
        }
    };

    /* ---------------- BACKEND ANALİZ ---------------- */
    const analyzeWithBackend = async (uri: string) => {
        setLoading(true);

        try {
            const AI_URL = process.env.EXPO_PUBLIC_AI_URL || "http://10.85.10.118:8000";

            const formData = new FormData();

            formData.append("file", {
                uri: uri,
                name: "pet_analysis.jpg",
                type: "image/jpeg",
            } as any); // ✅ TS fix

            formData.append("description", "mobil test");

            console.log("➡️ AI'ya gönderiliyor...");

            // ❗❗❗ HEADER YOK ❗❗❗
            const res = await fetch(`${AI_URL}/analyze`, {
                method: "POST",
                body: formData,
            });

            const json = await res.json();

            console.log("✅ AI RESPONSE:", json);

            if (!json.success) {
                throw new Error("AI analiz başarısız");
            }

            // 🔥 AI SONUCUNU PET'E KAYDET (date YOK)
            if (petId && saveAIResultToPet) {
                saveAIResultToPet(petId, {
                    score: json.result?.score || json.score || 0,
                    notes:
                        json.result?.summary ||
                        json.result?.status ||
                        json.summary ||
                        "AI analizi tamamlandı",
                });
            }

            // Sonuç ekranına git
            navigation.navigate("AIResult", {
                petId,
                result: json.result || json,
                photoUri: uri,
            });

        } catch (err) {
            console.error("❌ AI ERROR:", err);
            Alert.alert("Analiz Hatası", "AI analizi başarısız oldu.");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- FOTOĞRAF DEĞİŞTİR ---------------- */
    const changePhoto = () => {
        setModalVisible(true);
    };

    /* ---------------- YENİ ANALİZ ---------------- */
    const startNewAnalysis = () => {
        setMedia(null);
        setModalVisible(true);
    };

    /* ---------------- VETERİNER BUL ---------------- */
    const findVeterinarian = () => {
        navigation.navigate("Vets");
    };

    /* ---------------- UI ---------------- */
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={26} color={colors.text} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Hurma AI Tarama</Text>

                    {/* ✅ STACK ÜZERİNDEN NAVIGATION */}
                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => navigation.getParent()?.navigate("AIHistory", { petId })}
                    >
                        <Ionicons
                            name="time-outline"
                            size={24}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.subtitle}>
                    Evcil hayvanınızın fotoğrafını yükleyin, yapay zekâ sağlık durumunu analiz etsin
                </Text>

                {media?.uri ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: media.uri }} style={styles.previewImage} />

                        <View style={styles.previewActions}>
                            <TouchableOpacity
                                style={styles.changeButton}
                                onPress={changePhoto}
                            >
                                <Ionicons name="camera-reverse-outline" size={20} color="white" />
                                <Text style={styles.changeButtonText}>Değiştir</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.analyzeButton}
                                onPress={() => analyzeWithBackend(media.uri)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="analytics-outline" size={20} color="white" />
                                        <Text style={styles.analyzeButtonText}>AI Analiz Yap</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.uploadCards}>
                        <TouchableOpacity
                            style={styles.uploadCard}
                            onPress={() => {
                                setImageSource("camera");
                                setModalVisible(true);
                            }}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name="camera-outline" size={40} color={colors.primary} />
                            </View>
                            <Text style={styles.uploadCardTitle}>Kamera ile Çek</Text>
                            <Text style={styles.uploadCardSubtitle}>Anlık fotoğraf çek</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.uploadCard}
                            onPress={() => {
                                setImageSource("gallery");
                                setModalVisible(true);
                            }}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name="images-outline" size={40} color={colors.primary} />
                            </View>
                            <Text style={styles.uploadCardTitle}>Galeriden Seç</Text>
                            <Text style={styles.uploadCardSubtitle}>Mevcut fotoğraflar</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>AI analiz yapıyor...</Text>
                        <Text style={styles.loadingSubtext}>Lütfen bekleyin</Text>
                    </View>
                )}

                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={findVeterinarian}
                    >
                        <Ionicons name="medkit-outline" size={24} color="white" />
                        <Text style={styles.quickActionText}>Veteriner Bul</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickActionButton, styles.historyButtonStyle]}
                        onPress={() => navigation.getParent()?.navigate("AIHistory", { petId })}
                    >
                        <Ionicons name="time-outline" size={24} color="white" />
                        <Text style={styles.quickActionText}>Geçmiş Analizler</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Fotoğraf Seç</Text>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={takePhoto}
                        >
                            <Ionicons name="camera" size={30} color={colors.text} />
                            <Text style={styles.modalOptionText}>Kamera ile Çek</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={pickFromGallery}
                        >
                            <Ionicons name="images" size={30} color={colors.text} />
                            <Text style={styles.modalOptionText}>Galeriden Seç</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCancelText}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

/* ---------------- STYLES ---------------- */
// 👇 Senin stillerin AYNEN KALDI
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContainer: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    backButton: { padding: 8 },
    title: { fontSize: 20, fontWeight: "700", color: colors.text },
    historyButton: { padding: 8 },
    subtitle: { fontSize: 14, color: colors.muted, textAlign: "center", marginBottom: 30, lineHeight: 20 },
    uploadCards: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
    uploadCard: { width: "48%", backgroundColor: colors.card, borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 1, borderColor: colors.border, elevation: 2 },
    iconContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", marginBottom: 12, borderWidth: 2, borderColor: colors.primary + "20" },
    uploadCardTitle: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 4, textAlign: "center" },
    uploadCardSubtitle: { fontSize: 12, color: colors.muted, textAlign: "center" },
    previewContainer: { marginBottom: 30 },
    previewImage: { width: "100%", height: 250, borderRadius: 16, marginBottom: 16, borderWidth: 3, borderColor: colors.primary + "40" },
    previewActions: { flexDirection: "row", justifyContent: "space-between" },
    changeButton: { flex: 1, backgroundColor: colors.muted, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginRight: 8 },
    changeButtonText: { color: "white", fontWeight: "600", marginLeft: 8 },
    analyzeButton: { flex: 2, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginLeft: 8 },
    analyzeButtonText: { color: "white", fontWeight: "600", marginLeft: 8 },
    loadingContainer: { alignItems: "center", marginVertical: 30, padding: 20, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
    loadingText: { fontSize: 16, color: colors.primary, fontWeight: "600", marginTop: 12 },
    loadingSubtext: { fontSize: 14, color: colors.muted, marginTop: 4 },
    quickActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    quickActionButton: { flex: 1, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginHorizontal: 5, elevation: 3 },
    historyButtonStyle: { backgroundColor: colors.secondary || "#6c757d" },
    quickActionText: { color: "white", fontWeight: "600", marginLeft: 8 },
    modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0, 0, 0, 0.5)" },
    modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 20, fontWeight: "700", color: colors.text, textAlign: "center", marginBottom: 24 },
    modalOption: { flexDirection: "row", alignItems: "center", paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalOptionText: { fontSize: 18, color: colors.text, marginLeft: 16 },
    modalCancel: { marginTop: 24, padding: 16, alignItems: "center" },
    modalCancelText: { fontSize: 16, color: colors.muted, fontWeight: "600" },
});
