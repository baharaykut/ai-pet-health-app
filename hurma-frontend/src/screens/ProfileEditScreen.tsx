import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import colors from "../theme/colors";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

// ======================================================
// 🖼️ URL NORMALIZER
// ======================================================
function normalizeUrl(p?: string | null) {
    if (!p) return null;
    if (p.startsWith("http")) return p;
    return `${API_BASE_URL}${p.startsWith("/") ? "" : "/"}${p}`;
}

export default function ProfileEditScreen() {
    const navigation = useNavigation<any>();
    const { user, refreshMe } = useAuth();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // ===============================
    // 👤 PROFİL FOTO + CACHE KIRICI
    // ===============================
    const profilePhotoUri = useMemo(() => {
        const p = (user as any)?.photoUrl;
        const url = normalizeUrl(p);
        if (!url) return null;
        return url + "?t=" + Date.now(); // cache break
    }, [user]);

    // ===============================
    // INIT FORM
    // ===============================
    useEffect(() => {
        if (user) {
            setName(user.fullName || user.name || "");
            setPhone(user.phone || "");
            setCity(user.city || "");
            setBio(user.bio || "");
        }
    }, [user]);

    // ===============================
    // 📸 FOTO SEÇ + UPLOAD
    // ===============================
    const pickAndUploadPhoto = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert("İzin gerekli", "Galeri izni vermen gerekiyor.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"], // ✅ doğru
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) return;

            const asset = result.assets?.[0];
            if (!asset?.uri) return;

            const formData = new FormData();

            formData.append("file", {
                uri: Platform.OS === "ios" ? asset.uri.replace("file://", "") : asset.uri,
                name: "profile.jpg",
                type: "image/jpeg",
            } as any);

            setUploadingPhoto(true);

            // ❗ Content-Type SET ETME — axios kendisi ayarlayacak
            await api.post("/api/Users/upload-profile-photo", formData);

            await refreshMe();

            Alert.alert("✅ Başarılı", "Profil fotoğrafı güncellendi.");
        } catch (e: any) {
            console.log("❌ Upload error:", e?.response?.data || e?.message || e);
            Alert.alert("❌ Hata", "Foto yüklenemedi.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    // ===============================
    // 💾 PROFİL KAYDET
    // ===============================
    const handleSave = async () => {
        if (loading) return;

        if (!name.trim()) {
            Alert.alert("Hata", "Ad Soyad boş olamaz");
            return;
        }

        try {
            setLoading(true);

            await api.put("/api/Users/update-profile", {
                fullName: name,
                phone,
                city,
                bio,
            });

            await refreshMe();

            Alert.alert("✅ Başarılı", "Profil güncellendi");
            navigation.goBack();
        } catch (e: any) {
            console.log("❌ PROFILE UPDATE ERROR:", e?.response?.data || e?.message);
            Alert.alert("❌ Hata", "Profil güncellenemedi");
        } finally {
            setLoading(false);
        }
    };

    // ===============================
    // 🎨 UI
    // ===============================
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Kişisel Bilgiler</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* AVATAR */}
            <View style={styles.avatarSection}>
                <TouchableOpacity style={styles.avatarWrap} onPress={pickAndUploadPhoto}>
                    {profilePhotoUri ? (
                        <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
                    ) : (
                        <Ionicons name="person" size={60} color={colors.primary} />
                    )}

                    <View style={styles.avatarBadge}>
                        {uploadingPhoto ? (
                            <ActivityIndicator />
                        ) : (
                            <Ionicons name="camera-outline" size={18} color={colors.primary} />
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            {/* FORM */}
            <View style={styles.card}>
                <Label text="Ad Soyad" />
                <Input value={name} onChangeText={setName} />

                <Label text="Telefon" />
                <Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

                <Label text="Şehir" />
                <Input value={city} onChangeText={setCity} />

                <Label text="Hakkımda" />
                <Input
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    style={{ height: 90, textAlignVertical: "top" }}
                />
            </View>

            {/* SAVE */}
            <TouchableOpacity
                style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveText}>Kaydet</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

/* ================== UI ================== */

function Label({ text }: { text: string }) {
    return <Text style={styles.label}>{text}</Text>;
}

function Input({ style, ...rest }: any) {
    return (
        <View style={styles.inputWrapper}>
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor={colors.muted}
                {...rest}
            />
        </View>
    );
}

/* ================== STYLES ================== */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
    },
    title: { fontSize: 18, fontWeight: "700", color: colors.text },

    avatarSection: { alignItems: "center", marginVertical: 10 },
    avatarWrap: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#FFF4EA",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    avatarImage: { width: "100%", height: "100%" },
    avatarBadge: {
        position: "absolute",
        right: 6,
        bottom: 6,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },

    card: {
        backgroundColor: colors.card,
        margin: 16,
        padding: 20,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
    },

    label: { fontSize: 13, color: colors.muted, marginTop: 12 },
    inputWrapper: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
    },
    input: { fontSize: 14, color: colors.text, paddingVertical: 10 },

    saveBtn: {
        margin: 16,
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
    },
    saveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
