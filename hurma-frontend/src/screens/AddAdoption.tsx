import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
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

export default function AddAdoption() {
    const navigation = useNavigation<any>();

    const [form, setForm] = useState({
        name: "",
        type: "",
        breed: "",
        location: "",
        contact: "",
        description: "",
    });

    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // ======================================================
    // 📸 PERMISSION
    // ======================================================
    useEffect(() => {
        (async () => {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert("İzin", "Fotoğraf seçmek için galeri izni gerekli.");
            }
        })();
    }, []);

    // ======================================================
    // 🖼️ PICK IMAGE
    // ======================================================
    const pickImage = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            quality: 0.85,
        });

        if (!res.canceled && res.assets.length > 0) {
            setImage(res.assets[0].uri);
        }
    };

    // ======================================================
    // 📤 SUBMIT (🔥 FETCH VERSION)
    // ======================================================
    const submit = async () => {
        if (!form.name || !form.type || !form.location || !form.contact) {
            Alert.alert("Uyarı", "Lütfen gerekli alanları doldur.");
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();

            data.append("Name", form.name);
            data.append("Type", form.type);
            data.append("Breed", form.breed || "");
            data.append("Location", form.location);
            data.append("Contact", form.contact);
            data.append("Description", form.description || "");

            if (image) {
                const filename = image.split("/").pop() || `photo_${Date.now()}.jpg`;

                data.append("Photo", {
                    uri: Platform.OS === "android" ? image : image.replace("file://", ""),
                    name: filename,
                    type: "image/jpeg",
                } as any);
            }

            console.log("📤 UPLOAD START (fetch)...");

            const res = await fetch("http://10.189.4.112:5058/api/Adoptions/upload", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    // Authorization gerekiyorsa buraya eklenir
                    // "Authorization": `Bearer TOKEN`
                },
                body: data,
            });

            const json = await res.json();
            console.log("✅ UPLOAD RESPONSE:", json);

            if (!res.ok) {
                throw new Error(JSON.stringify(json));
            }

            Alert.alert("Başarılı", "İlan eklendi 🎉");
            navigation.navigate("AdoptionHome");

        } catch (err: any) {
            console.log("❌ ADD ADOPTION ERROR FULL:", err);
            Alert.alert("Hata", "İlan eklenemedi: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // 🧱 UI
    // ======================================================
    return (
        <ScrollView style={styles.page} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.title}>🐾 Yeni Sahiplendirme İlanı</Text>

            <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="camera" size={36} color="#aaa" />
                        <Text style={{ color: "#888", marginTop: 6 }}>Fotoğraf Seç</Text>
                    </View>
                )}
            </TouchableOpacity>

            {(
                [
                    ["name", "İsim *"],
                    ["type", "Tür (kedi/köpek) *"],
                    ["breed", "Cins"],
                    ["location", "Şehir *"],
                    ["contact", "Telefon *"],
                ] as const
            ).map(([key, label]) => (
                <TextInput
                    key={key}
                    placeholder={label}
                    value={form[key]}
                    onChangeText={(t) => setForm({ ...form, [key]: t })}
                    style={styles.input}
                />
            ))}

            <TextInput
                placeholder="Açıklama"
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                style={[styles.input, { height: 100 }]}
                multiline
            />

            <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={loading}>
                <Text style={styles.submitText}>
                    {loading ? "Gönderiliyor..." : "📤 İlanı Yayınla"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// ======================================================
// 🎨 STYLES
// ======================================================
const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: "#f8f9fb" },
    title: { fontSize: 26, fontWeight: "900", marginBottom: 16 },

    imageBox: {
        height: 220,
        borderRadius: 16,
        backgroundColor: "#eee",
        marginBottom: 12,
        overflow: "hidden",
    },
    image: { width: "100%", height: "100%" },
    imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },

    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#eee",
    },

    submitBtn: {
        backgroundColor: "#ff8800",
        padding: 14,
        borderRadius: 14,
        marginTop: 10,
        alignItems: "center",
    },
    submitText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
