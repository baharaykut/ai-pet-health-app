import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
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

import { useAuth } from "../context/AuthContext";
import api from "../services/api"; // ✅ TEK MERKEZ
import colors from "../theme/colors";

export default function RegisterScreen({ navigation }: any) {
    const { login } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const isValid = useMemo(() => {
        return (
            fullName.trim().length >= 3 &&
            email.trim().includes("@") &&
            password.length >= 6
        );
    }, [fullName, email, password]);

    const handleRegister = useCallback(async () => {
        if (!isValid) {
            return Alert.alert(
                "Eksik / Hatalı Bilgi",
                "Ad soyad en az 3 karakter, şifre en az 6 karakter olmalıdır."
            );
        }

        setLoading(true);

        try {
            // ✅ REGISTER
            await api.post("/api/Auth/register", {
                email: email.trim(),
                password,
            });

            // ✅ AUTO LOGIN
            const loginRes = await api.post("/api/Auth/login", {
                email: email.trim(),
                password,
            });

            const { token, role } = loginRes.data;

            if (!token) {
                throw new Error("Token alınamadı");
            }

            await login(token, role ?? null);
        } catch (err: any) {
            console.log("REGISTER ERROR:", err?.response?.data || err.message);

            if (err?.response?.status === 400) {
                return Alert.alert("Hata", err.response.data?.message || "Kayıt başarısız.");
            }

            Alert.alert("Bağlantı Hatası ❌", "Sunucuya ulaşılamıyor.");
        } finally {
            setLoading(false);
        }
    }, [email, password, fullName, isValid, login]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.flex}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Ionicons name="paw" size={34} color={colors.primary} />
                        <Text style={styles.headerText}>Hurma’ya Katıl</Text>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Ad Soyad"
                        placeholderTextColor={colors.muted}
                        value={fullName}
                        onChangeText={setFullName}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="E-posta"
                        placeholderTextColor={colors.muted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Şifre (en az 6 karakter)"
                        placeholderTextColor={colors.muted}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity
                        style={[styles.button, (!isValid || loading) && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={!isValid || loading}
                        activeOpacity={0.85}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Zaten hesabın var mı?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.footerLink}>Giriş Yap</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
    card: { backgroundColor: colors.card, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: colors.border },
    header: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 24 },
    headerText: { fontSize: 22, fontWeight: "800", color: colors.text, marginLeft: 10 },
    input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 14, color: colors.text },
    button: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 6 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
    footer: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
    footerText: { color: colors.muted, marginRight: 6 },
    footerLink: { color: colors.primary, fontWeight: "700" },
});

