import { Ionicons } from "@expo/vector-icons";
import { CommonActions, useFocusEffect, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useMemo, useState } from "react";
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

import { useAuth } from "../context/AuthContext";
import { usePets } from "../context/PetContext";
import { getApiToken } from "../services/api";
import colors from "../theme/colors";

// 🌍 API BASE URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

export default function ProfileScreen() {
    const navigation = useNavigation<any>();

    const { pets = [], deletePet, refreshPets } = usePets();
    const { user, role, logout, refreshMe } = useAuth();

    const [uploading, setUploading] = useState(false);

    // 🔥 EKRAN HER AÇILDIĞINDA PETLERİ YENİDEN ÇEK
    useFocusEffect(
        useCallback(() => {
            refreshPets();
        }, [])
    );

    const displayName = useMemo(() => {
        return user?.fullName || user?.name || user?.email || "Kullanıcı";
    }, [user]);

    const username = useMemo(() => {
        return user?.email ? `@${user.email.split("@")[0]}` : "@user";
    }, [user]);

    // ✅ SAFE NAVIGATE
    const go = (name: string, params?: any) => {
        navigation.dispatch(
            CommonActions.navigate({
                name,
                params,
            })
        );
    };

    // ===============================
    // 👤 PROFİL FOTO URL
    // ===============================
    const profilePhotoUri = useMemo(() => {
        const p = (user as any)?.photoUrl;
        if (!p) return null;
        if (typeof p === "string" && p.startsWith("http")) return p;
        return `${API_BASE_URL}${p.startsWith("/") ? "" : "/"}${p}`;
    }, [user]);

    const handleLogout = () => {
        Alert.alert("Çıkış Yap", "Hesabından çıkmak istiyor musun?", [
            { text: "İptal", style: "cancel" },
            {
                text: "Çıkış Yap",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "Login" }],
                        })
                    );
                },
            },
        ]);
    };

    const confirmDeletePet = (id: number) => {
        Alert.alert("Sil", "Bu hayvanı silmek istiyor musun?", [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil",
                style: "destructive",
                onPress: async () => {
                    await deletePet(id);
                    await refreshPets();
                },
            },
        ]);
    };

    const openAIHistory = () => {
        if (pets.length === 0) {
            Alert.alert("Uyarı", "Önce bir hayvan eklemelisin.");
            return;
        }
        go("AIHistory", { petId: pets[0].id });
    };

    const openAddPet = () => {
        go("AddPet");
    };

    // ===============================
    // 📸 PROFİL FOTO UPLOAD
    // ===============================
    const pickAndUploadProfilePhoto = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert("İzin gerekli", "Galeri izni vermen gerekiyor.");
                return;
            }

            const MEDIA_IMAGES =
                (ImagePicker as any).MediaType?.Images ??
                (ImagePicker as any).MediaTypeOptions?.Images;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: MEDIA_IMAGES,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) return;

            const asset = result.assets?.[0];
            if (!asset?.uri) return;

            const formData = new FormData();
            formData.append("file", {
                uri: asset.uri,
                name: "profile.jpg",
                type: "image/jpeg",
            } as any);

            const token = getApiToken();
            if (!token) {
                Alert.alert("Hata", "Oturum bulunamadı.");
                return;
            }

            setUploading(true);

            const res = await fetch(`${API_BASE_URL}/api/Users/upload-profile-photo`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) throw new Error(await res.text());

            await refreshMe?.();
            Alert.alert("✅ Başarılı", "Profil fotoğrafı güncellendi.");
        } catch {
            Alert.alert("❌ Hata", "Foto yüklenemedi.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* ===== PROFILE CARD ===== */}
            <View style={styles.profileCard}>
                <TouchableOpacity style={styles.avatarWrap} onPress={pickAndUploadProfilePhoto}>
                    {profilePhotoUri ? (
                        <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
                    ) : (
                        <Ionicons name="person" size={42} color={colors.primary} />
                    )}
                    <View style={styles.avatarBadge}>
                        {uploading ? <ActivityIndicator /> : <Ionicons name="camera-outline" size={16} />}
                    </View>
                </TouchableOpacity>

                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.username}>{username}</Text>

                {role && (
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{role === "VET" ? "Veteriner" : "Kullanıcı"}</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={18} color="#fff" />
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>
            </View>

            {/* ===== MENU ===== */}
            <View style={styles.menuBox}>
                <MenuItem icon="person-outline" label="Kişisel Bilgiler" onPress={() => go("ProfileEdit")} />
                <MenuItem icon="location-outline" label="Adreslerim" onPress={() => go("Addresses")} />
                <MenuItem icon="receipt-outline" label="Siparişlerim" onPress={() => go("Orders")} />
                <MenuItem icon="analytics-outline" label="AI Geçmişim" onPress={openAIHistory} />
                <MenuItem icon="settings-outline" label="Ayarlar" onPress={() => go("Settings")} />
            </View>

            {/* ===== PET LIST ===== */}
            <Text style={styles.sectionTitle}>Evcil Dostlarım</Text>

            {pets.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Ionicons name="paw-outline" size={32} color={colors.muted} />
                    <Text style={styles.emptyTitle}>Henüz hayvan eklemedin</Text>
                    <Text style={styles.emptySub}>AI analiz için önce hayvan ekle</Text>
                </View>
            ) : (
                pets.map((pet: any) => (
                    <View key={pet.id} style={styles.petCard}>
                        <TouchableOpacity style={styles.petLeft} onPress={() => go("PetDetails", { petId: pet.id })}>
                            <Image
                                source={{
                                    uri: pet.photoUrl
                                        ? pet.photoUrl.startsWith("http")
                                            ? pet.photoUrl
                                            : `${API_BASE_URL}${pet.photoUrl}`
                                        : "https://placekitten.com/200/200",
                                }}
                                style={styles.petImage}
                            />
                            <View>
                                <Text style={styles.petName}>{pet.name}</Text>
                                <Text style={styles.petMeta}>{pet.type} • {pet.breed} • {pet.age}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => confirmDeletePet(pet.id)}>
                            <Ionicons name="trash-outline" size={22} color={colors.danger} />
                        </TouchableOpacity>
                    </View>
                ))
            )}

            <TouchableOpacity style={styles.addButton} onPress={openAddPet}>
                <Ionicons name="add-circle-outline" size={22} color="#fff" />
                <Text style={styles.addButtonText}>Yeni Hayvan Ekle</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>Hurma App © 2026 | Assan Bilişim</Text>
        </ScrollView>
    );
}

/* ================= COMPONENT ================= */

function MenuItem({ icon, label, onPress }: { icon: any; label: string; onPress?: () => void }) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon} size={22} color={colors.primary} />
            <Text style={styles.menuText}>{label}</Text>
        </TouchableOpacity>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    profileCard: { backgroundColor: "#fff", margin: 16, borderRadius: 22, alignItems: "center", paddingVertical: 26, borderWidth: 1, borderColor: colors.border },
    avatarWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#FFF4EA", alignItems: "center", justifyContent: "center", marginBottom: 10, position: "relative", overflow: "hidden" },
    avatarImage: { width: "100%", height: "100%" },
    avatarBadge: { position: "absolute", right: 6, bottom: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    name: { fontSize: 20, fontWeight: "900", color: colors.text },
    username: { fontSize: 14, color: colors.muted, fontWeight: "600" },
    roleBadge: { marginTop: 6, backgroundColor: "#EAF6FF", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    roleText: { fontSize: 12, fontWeight: "800", color: colors.primary },
    logoutBtn: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.danger, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    logoutText: { color: "#fff", fontWeight: "800" },
    menuBox: { backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: 10 },
    menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: colors.border },
    menuText: { marginLeft: 12, fontSize: 16, fontWeight: "700", color: colors.text },
    sectionTitle: { fontSize: 18, fontWeight: "900", marginLeft: 20, marginTop: 10, marginBottom: 8, color: colors.text },
    petCard: { backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 10, borderRadius: 18, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.border },
    petLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    petImage: { width: 64, height: 64, borderRadius: 32 },
    petName: { fontSize: 16, fontWeight: "900", color: colors.text },
    petMeta: { fontSize: 13, color: colors.muted, fontWeight: "600" },
    addButton: { margin: 16, backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    addButtonText: { color: "#fff", fontSize: 16, fontWeight: "900" },
    emptyBox: { margin: 16, backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center", borderWidth: 1, borderColor: colors.border },
    emptyTitle: { fontSize: 16, fontWeight: "800", marginTop: 8, color: colors.text },
    emptySub: { fontSize: 13, color: colors.muted, textAlign: "center" },
    footer: { textAlign: "center", marginTop: 10, color: colors.muted, fontSize: 12 },
});
