import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";
import { RootStackParamList } from "../navigation/AppNavigator";

type EditRouteProp = RouteProp<RootStackParamList, "EditAdoption">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "AdoptionDetail">;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5058";

export default function EditAdoptionScreen() {
    const route = useRoute<EditRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const adoption = route.params?.adoption;

    const [form, setForm] = useState({
        name: adoption.name || "",
        type: adoption.type || "",
        breed: adoption.breed || "",
        location: adoption.location || "",
        contact: adoption.contact || "",
        description: adoption.description || "",
    });
    const [image, setImage] = useState<string | null>(adoption.photoUrl);

    // 📸 Fotoğraf seçici
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    // 💾 Kaydet (PUT)
    const handleSave = async () => {
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => formData.append(key, value));

            if (image && !image.startsWith("http")) {
                const fileName = image.split("/").pop();
                const fileType = fileName?.split(".").pop();
                formData.append("Photo", {
                    uri: image,
                    type: `image/${fileType}`,
                    name: fileName,
                } as any);
            }

            await axios.put(`${API_BASE_URL}/api/Adoptions/${adoption.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            Alert.alert("Başarılı 🎉", "İlan başarıyla güncellendi!");
            navigation.goBack();
        } catch (error) {
            console.error("Güncelleme hatası:", error);
            Alert.alert("Hata", "İlan güncellenemedi 😔");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>✏️ İlanı Düzenle</Text>

            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                <Image
                    source={{ uri: image || "https://place-puppy.com/400x300" }}
                    style={styles.image}
                />
                <Text style={styles.changeText}>📸 Fotoğrafı Değiştir</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="Ad"
                value={form.name}
                onChangeText={(v) => handleChange("name", v)}
            />
            <TextInput
                style={styles.input}
                placeholder="Tür (Köpek / Kedi)"
                value={form.type}
                onChangeText={(v) => handleChange("type", v)}
            />
            <TextInput
                style={styles.input}
                placeholder="Cins"
                value={form.breed}
                onChangeText={(v) => handleChange("breed", v)}
            />
            <TextInput
                style={styles.input}
                placeholder="Konum"
                value={form.location}
                onChangeText={(v) => handleChange("location", v)}
            />
            <TextInput
                style={styles.input}
                placeholder="İletişim (Telefon)"
                value={form.contact}
                onChangeText={(v) => handleChange("contact", v)}
            />
            <TextInput
                style={[styles.input, { height: 100 }]}
                placeholder="Açıklama"
                multiline
                value={form.description}
                onChangeText={(v) => handleChange("description", v)}
            />

            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveText}>💾 Kaydet</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fb", padding: 16 },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 14,
        fontSize: 15,
    },
    imagePicker: { alignItems: "center", marginBottom: 20 },
    image: { width: "100%", height: 220, borderRadius: 12 },
    changeText: { marginTop: 8, color: "#ff8800", fontWeight: "600" },
    saveButton: {
        backgroundColor: "#25D366",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
