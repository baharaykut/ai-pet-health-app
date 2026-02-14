import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
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

import { usePets } from "../context/PetContext";
import api from "../services/api";
import colors from "../theme/colors";

// ================= URL JOIN =================
function joinUrl(base: string, path: string) {
    if (!base) return path;
    if (!path) return base;
    if (base.endsWith("/") && path.startsWith("/")) return base + path.substring(1);
    if (!base.endsWith("/") && !path.startsWith("/")) return base + "/" + path;
    return base + path;
}

const FALLBACK_IMAGE = "https://cdn-icons-png.flaticon.com/512/616/616408.png";

export default function PetEditScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { petId } = route.params as { petId: number };

    const { pets, refreshPets } = usePets();
    const pet = useMemo(() => pets.find((p) => p.id === petId), [pets, petId]);

    if (!pet) {
        return (
            <View style={styles.center}>
                <Text style={{ color: colors.muted }}>Hayvan bulunamadı 🐾</Text>
            </View>
        );
    }

    // ===============================
    // STATE
    // ===============================
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [name, setName] = useState(String(pet.name || ""));
    const [type, setType] = useState(String(pet.type || ""));
    const [breed, setBreed] = useState(String(pet.breed || ""));
    const [age, setAge] = useState(pet.age != null ? String(pet.age) : "");
    const [weight, setWeight] = useState(pet.weight != null ? String(pet.weight) : "");
    const [height, setHeight] = useState(pet.height != null ? String(pet.height) : "");

    const [rabiesDate, setRabiesDate] = useState<Date | null>(
        pet.rabiesVaccineDate ? new Date(pet.rabiesVaccineDate) : null
    );
    const [internalDate, setInternalDate] = useState<Date | null>(
        pet.internalParasiteDate ? new Date(pet.internalParasiteDate) : null
    );
    const [externalDate, setExternalDate] = useState<Date | null>(
        pet.externalParasiteDate ? new Date(pet.externalParasiteDate) : null
    );

    const [showPicker, setShowPicker] = useState<null | "rabies" | "internal" | "external">(null);

    // ===============================
    // PHOTO URL RESOLVE
    // ===============================
    const rawPhoto = (pet as any).photoUrl || (pet as any).photo || null;

    const photoUri = rawPhoto
        ? rawPhoto.startsWith("http")
            ? rawPhoto
            : joinUrl(api.defaults.baseURL || "", rawPhoto)
        : FALLBACK_IMAGE;

    // ===============================
    // 📸 PHOTO UPLOAD
    // ===============================
    const changePhoto = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert("İzin gerekli", "Galeri izni vermelisin");
                return;
            }

            const mediaTypes =
                (ImagePicker as any).MediaType?.Images ??
                (ImagePicker as any).MediaTypeOptions?.Images;

            const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes,
                quality: 0.8,
            });

            if (res.canceled) return;

            let uri = res.assets?.[0]?.uri;
            if (!uri) {
                Alert.alert("Hata", "Foto seçilemedi");
                return;
            }

            // 🔥🔥🔥 ANDROID FIX
            if (Platform.OS === "android" && uri.startsWith("file://")) {
                uri = uri.replace("file://", "");
            }

            console.log("📤 REAL FILE PATH:", uri);

            const form = new FormData();
            form.append("photo", {
                uri: Platform.OS === "android" ? uri : uri,
                name: "pet.jpg",
                type: "image/jpeg",
            } as any);

            console.log("📤 UPLOAD URL:", `/api/Pets/${pet.id}/upload-photo`);

            // ❗❗❗ Content-Type YOK !!!
            await api.post(`/api/Pets/${pet.id}/upload-photo`, form);

            await refreshPets();
            Alert.alert("✅ Başarılı", "Fotoğraf güncellendi");
        } catch (e: any) {
            console.log("❌ PHOTO UPLOAD ERROR FULL:", e);
            Alert.alert("❌ Hata", "Foto yüklenemedi: " + (e?.message || ""));
        }
    };


    // ===============================
    // SAVE
    // ===============================
    const handleSave = async () => {
        if (!name.trim()) return Alert.alert("Hata", "İsim boş olamaz");
        if (!type.trim()) return Alert.alert("Hata", "Tür boş olamaz");

        try {
            setLoading(true);

            await api.put(`/api/Pets/${pet.id}`, {
                name: name.trim(),
                type: type.trim(),
                breed: breed.trim() || null,
                age: age.trim() || null,
                weight: weight.trim() || null,
                height: height.trim() || null,
                rabiesVaccineDate: rabiesDate ? rabiesDate.toISOString() : null,
                internalParasiteDate: internalDate ? internalDate.toISOString() : null,
                externalParasiteDate: externalDate ? externalDate.toISOString() : null,
            });

            await refreshPets();
            Alert.alert("✅ Başarılı", "Pet güncellendi 🐾");
            navigation.goBack();
        } catch (err: any) {
            console.log("PET UPDATE ERROR:", err?.response?.data || err?.message || err);
            Alert.alert("❌ Hata", "Güncelleme sırasında hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    // ===============================
    // DATE PICKER
    // ===============================
    const onPickDate = (_: any, date?: Date) => {
        if (Platform.OS !== "ios") setShowPicker(null);
        if (!date) return;

        if (showPicker === "rabies") setRabiesDate(date);
        if (showPicker === "internal") setInternalDate(date);
        if (showPicker === "external") setExternalDate(date);
    };

    const formatDate = (d: Date | null) => (d ? d.toLocaleDateString("tr-TR") : "Seçilmedi");

    const getPickerValue = () => {
        if (showPicker === "rabies") return rabiesDate || new Date();
        if (showPicker === "internal") return internalDate || new Date();
        if (showPicker === "external") return externalDate || new Date();
        return new Date();
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Evcil Dostu Düzenle</Text>
                <View style={{ width: 30 }} />
            </View>

            {/* PHOTO */}
            <TouchableOpacity style={styles.photoWrap} onPress={changePhoto}>
                <Image source={{ uri: photoUri }} style={styles.photo} />
                <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={18} color="#fff" />
                </View>
            </TouchableOpacity>

            {/* FORM */}
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 200 }}>
                <Section title="Genel Bilgiler" />
                <Input label="İsim" value={name} onChange={setName} />
                <Input label="Tür" value={type} onChange={setType} />
                <Input label="Cins" value={breed} onChange={setBreed} />
                <Input label="Yaş" value={age} onChange={setAge} />

                <Section title="Fiziksel Bilgiler" />
                <Input label="Kilo" value={weight} onChange={setWeight} />
                <Input label="Boy" value={height} onChange={setHeight} />

                <Section title="Aşı Takvimi" />
                <DateRow label="Kuduz" value={formatDate(rabiesDate)} onPress={() => setShowPicker("rabies")} />
                <DateRow label="İç Parazit" value={formatDate(internalDate)} onPress={() => setShowPicker("internal")} />
                <DateRow label="Dış Parazit" value={formatDate(externalDate)} onPress={() => setShowPicker("external")} />

                {showPicker && <DateTimePicker value={getPickerValue()} mode="date" display="default" onChange={onPickDate} />}
            </ScrollView>

            {/* SAVE */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Kaydet</Text>}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

/* ================= COMPONENTS ================= */

function Section({ title }: { title: string }) {
    return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <View style={{ marginBottom: 12 }}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput value={value} onChangeText={onChange} style={styles.input} placeholder={label} placeholderTextColor={colors.muted} />
        </View>
    );
}

function DateRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.dateRow} onPress={onPress}>
            <Text style={styles.dateLabel}>{label}</Text>
            <Text style={styles.dateValue}>{value}</Text>
        </TouchableOpacity>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },

    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: colors.background },
    headerTitle: { fontSize: 18, fontWeight: "800", color: colors.text },

    photoWrap: { alignSelf: "center", marginTop: 10, marginBottom: 10 },
    photo: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: colors.primary },

    cameraBadge: { position: "absolute", bottom: 6, right: 6, backgroundColor: colors.primary, borderRadius: 20, padding: 6 },

    sectionTitle: { marginTop: 14, marginBottom: 6, fontSize: 16, fontWeight: "800", color: colors.text },
    inputLabel: { fontSize: 13, marginBottom: 4, color: colors.muted },

    input: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12, fontSize: 15, color: colors.text },

    dateRow: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" },

    dateLabel: { color: colors.text, fontWeight: "700" },
    dateValue: { color: colors.primary, fontWeight: "700" },

    footer: { position: "absolute", bottom: 90, left: 0, right: 0, padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderColor: colors.border },

    saveButton: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
