import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../services/api";
import colors from "../theme/colors";

export default function ChangePasswordScreen() {
    const navigation = useNavigation<any>();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!oldPassword || !newPassword || !newPassword2) {
            Alert.alert("Hata", "Tüm alanları doldur.");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Hata", "Yeni şifre en az 6 karakter olmalı.");
            return;
        }

        if (newPassword !== newPassword2) {
            Alert.alert("Hata", "Yeni şifreler uyuşmuyor.");
            return;
        }

        try {
            setLoading(true);

            await api.post("/api/Auth/change-password", {
                oldPassword,
                newPassword,
            });

            Alert.alert("Başarılı", "Şifren başarıyla değiştirildi 🔐", [
                {
                    text: "Tamam",
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (err: any) {
            console.log("CHANGE PASSWORD ERROR:", err?.response?.data || err);

            Alert.alert(
                "Hata",
                err?.response?.data?.message || "Şifre değiştirilemedi."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={26} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Şifre Değiştir</Text>
                    <View style={{ width: 26 }} />
                </View>

                {/* CARD */}
                <View style={styles.card}>
                    <Text style={styles.label}>Mevcut Şifre</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Mevcut şifren"
                        secureTextEntry
                        value={oldPassword}
                        onChangeText={setOldPassword}
                    />

                    <Text style={styles.label}>Yeni Şifre</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Yeni şifre"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />

                    <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Yeni şifre tekrar"
                        secureTextEntry
                        value={newPassword2}
                        onChangeText={setNewPassword2}
                    />

                    <TouchableOpacity
                        style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                        onPress={submit}
                        disabled={loading}
                    >
                        <Text style={styles.saveText}>
                            {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.text,
    },
    card: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.muted,
        marginTop: 12,
        marginBottom: 6,
    },
    input: {
        backgroundColor: colors.cardAlt,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    saveBtn: {
        marginTop: 24,
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
    },
    saveText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "800",
    },
});
