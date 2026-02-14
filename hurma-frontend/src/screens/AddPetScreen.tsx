import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../theme/colors";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

export default function AddPetScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [breed, setBreed] = useState("");
    const [age, setAge] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");

    const [rabiesDate, setRabiesDate] = useState("");
    const [internalDate, setInternalDate] = useState("");
    const [externalDate, setExternalDate] = useState("");

    const [photo, setPhoto] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // ===========================
    // 📸 FOTO SEÇ
    // ===========================
    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("İzin gerekli", "Galeri izni vermelisin");
            return;
        }

        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!res.canceled) {
            setPhoto(res.assets[0].uri);
        }
    };

    // ===========================
    // 🛡️ TARİH KONTROL
    // ===========================
    const safeDate = (s: string) => {
        const t = s.trim();
        if (!t) return null;
        const d = new Date(t);
        if (isNaN(d.getTime())) return null;
        return d.toISOString();
    };

    // ===========================
    // 💾 KAYDET
    // ===========================
    const save = async () => {
        if (!name.trim()) {
            Alert.alert("Hata", "İsim zorunlu");
            return;
        }

        if (!type.trim()) {
            Alert.alert("Hata", "Tür zorunlu");
            return;
        }

        try {
            setSaving(true);

            const form = new FormData();

            form.append("Name", name.trim());
            form.append("Type", type.trim());

            if (breed.trim()) form.append("Breed", breed.trim());
            if (age.trim()) form.append("Age", age.trim());
            if (weight.trim()) form.append("Weight", weight.trim());
            if (height.trim()) form.append("Height", height.trim());

            const r = safeDate(rabiesDate);
            const i = safeDate(internalDate);
            const e = safeDate(externalDate);

            if (r) form.append("RabiesVaccineDate", r);
            if (i) form.append("InternalParasiteDate", i);
            if (e) form.append("ExternalParasiteDate", e);

            if (photo) {
                const fileName = photo.split("/").pop() || "pet.jpg";

                form.append("Photo", {
                    uri: photo,
                    name: fileName,
                    type: "image/jpeg",
                } as any);
            }

            // 🔐 TOKEN'U DOĞRU YERDEN AL
            const token = await AsyncStorage.getItem("auth_token");

            if (!token) {
                Alert.alert("Hata", "Oturum bulunamadı, tekrar giriş yap.");
                return;
            }

            const res = await fetch(`${API_BASE_URL}/api/Pets`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // ❗ Content-Type EKLEME
                },
                body: form,
            });

            if (!res.ok) {
                const text = await res.text();
                console.log("❌ SERVER ERROR:", text);
                throw new Error("Upload failed");
            }

            Alert.alert("✅ Başarılı", "Pet eklendi");
            navigation.goBack();
        } catch (err: any) {
            console.log("ADD PET ERROR:", err?.message || err);
            Alert.alert("❌ Hata", "Pet eklenemedi");
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={{
                    paddingBottom: 140 + insets.bottom,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>🐾 Yeni Dostunu Ekle</Text>

                <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
                    {photo ? (
                        <Image source={{ uri: photo }} style={styles.photo} />
                    ) : (
                        <Text style={{ color: colors.muted }}>📸 Fotoğraf Seç</Text>
                    )}
                </TouchableOpacity>

                <TextInput style={styles.input} placeholder="Ad *" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Tür (Kedi/Köpek) *" value={type} onChangeText={setType} />
                <TextInput style={styles.input} placeholder="Cins" value={breed} onChangeText={setBreed} />
                <TextInput style={styles.input} placeholder="Yaş" value={age} onChangeText={setAge} />
                <TextInput style={styles.input} placeholder="Kilo (kg)" value={weight} onChangeText={setWeight} />
                <TextInput style={styles.input} placeholder="Boy (cm)" value={height} onChangeText={setHeight} />

                <Text style={styles.section}>💉 Aşı Tarihleri (YYYY-MM-DD)</Text>

                <TextInput style={styles.input} placeholder="Kuduz" value={rabiesDate} onChangeText={setRabiesDate} />
                <TextInput style={styles.input} placeholder="İç Parazit" value={internalDate} onChangeText={setInternalDate} />
                <TextInput style={styles.input} placeholder="Dış Parazit" value={externalDate} onChangeText={setExternalDate} />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                <TouchableOpacity
                    style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                    onPress={save}
                    disabled={saving}
                >
                    <Text style={styles.saveText}>
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

// =========================
// 🎨 STYLES
// =========================
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: "900", marginBottom: 20, textAlign: "center", color: colors.primary },
    section: { fontWeight: "800", marginTop: 16, marginBottom: 6, color: colors.primary },

    photoBox: {
        height: 160,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
    },

    photo: { width: "100%", height: "100%" },

    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
    },

    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: 16,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderColor: colors.border,
    },

    saveBtn: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 16,
        alignItems: "center",
    },

    saveText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
