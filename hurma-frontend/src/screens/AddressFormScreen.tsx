import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";
import { userService } from "../services/userService";

export default function AddressFormScreen({ navigation, route }: any) {
    // ✏️ Edit modunda adres buradan gelir
    const address = route?.params?.address;

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "",
        fullName: "",
        phone: "",
        city: "",
        district: "",
        detail: "",
    });

    // 🔄 Edit ise formu doldur
    useEffect(() => {
        if (address) {
            setForm({
                title: address.title ?? "",
                fullName: address.fullName ?? "",
                phone: address.phone ?? "",
                city: address.city ?? "",
                district: address.district ?? "",
                detail: address.detail ?? "",
            });
        }
    }, [address]);

    const change = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const save = async () => {
        if (!form.title || !form.fullName || !form.phone) {
            Alert.alert(
                "Uyarı",
                "Adres başlığı, ad soyad ve telefon zorunludur"
            );
            return;
        }

        try {
            setLoading(true);

            if (address) {
                // ✏️ UPDATE
                await userService.updateAddress(address.id, form);
                Alert.alert("✅ Başarılı", "Adres güncellendi");
            } else {
                // ➕ CREATE
                await userService.createAddress(form);
                Alert.alert("✅ Başarılı", "Adres eklendi");
            }

            navigation.goBack();
        } catch (e: any) {
            Alert.alert(
                "Hata",
                e?.response?.data?.message ??
                e?.response?.data ??
                "Adres kaydedilemedi"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>
                {address ? "Adres Düzenle" : "Yeni Adres"}
            </Text>

            <TextInput
                placeholder="Adres Başlığı (Ev, İş vb.)"
                value={form.title}
                onChangeText={(v) => change("title", v)}
                style={styles.input}
            />

            <TextInput
                placeholder="Ad Soyad"
                value={form.fullName}
                onChangeText={(v) => change("fullName", v)}
                style={styles.input}
            />

            <TextInput
                placeholder="Telefon"
                value={form.phone}
                onChangeText={(v) => change("phone", v)}
                keyboardType="phone-pad"
                style={styles.input}
            />

            <TextInput
                placeholder="Şehir"
                value={form.city}
                onChangeText={(v) => change("city", v)}
                style={styles.input}
            />

            <TextInput
                placeholder="İlçe"
                value={form.district}
                onChangeText={(v) => change("district", v)}
                style={styles.input}
            />

            <TextInput
                placeholder="Adres Detayı (Mahalle, sokak, no, daire...)"
                value={form.detail}
                onChangeText={(v) => change("detail", v)}
                style={[styles.input, { height: 100 }]}
                multiline
            />

            <TouchableOpacity
                style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                onPress={save}
                disabled={loading}
            >
                <Text style={styles.saveText}>
                    {loading
                        ? "Kaydediliyor..."
                        : address
                            ? "Güncelle"
                            : "Kaydet"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },

    title: {
        fontSize: 22,
        fontWeight: "900",
        marginBottom: 16,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        backgroundColor: "#fff",
    },

    saveBtn: {
        backgroundColor: "#4CAF50",
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 10,
    },

    saveText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 16,
    },
});
