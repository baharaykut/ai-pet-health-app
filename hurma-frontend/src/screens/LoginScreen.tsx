import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "../context/AuthContext";
import api, { setApiToken } from "../services/api"; // ✅ BURASI ÇOK ÖNEMLİ
import colors from "../theme/colors";

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // ======================
    // VALIDATION
    // ======================
    const isValid = useMemo(
        () => email.trim().includes("@") && password.length >= 6,
        [email, password]
    );

    // ======================
    // LOGIN HANDLER
    // ======================
    const handleLogin = useCallback(async () => {
        if (!isValid) {
            Alert.alert(
                "Eksik / Hatalı Bilgi",
                "Geçerli bir e-posta ve en az 6 karakterli şifre gir."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/api/Auth/login", {
                email: email.trim(),
                password,
            });

            console.log("✅ LOGIN RESPONSE:", response.data);

            const { token, role } = response.data;

            if (!token) {
                throw new Error("Login response token içermiyor");
            }

            // ====================================================
            // 🔥🔥🔥 EN KRİTİK SATIR
            // ====================================================
            setApiToken(token); // ✅ ARTIK TÜM İSTEKLER TOKEN'LI

            // 🔥 TOKEN'I KALICI OLARAK KAYDET
            await AsyncStorage.setItem("AUTH_TOKEN", token);
            console.log("💾 TOKEN AsyncStorage'a kaydedildi");

            // ✅ Context'e de ver
            await login(token, role ?? null);

        } catch (err: any) {
            console.log("❌ LOGIN ERROR:", err?.response?.data || err.message);

            if (err?.response?.status === 401) {
                Alert.alert("Hatalı Giriş", "E-posta veya şifre yanlış.");
                return;
            }

            Alert.alert("Giriş Hatası ❌", "Giriş yapılamadı.");
        } finally {
            setLoading(false);
        }
    }, [email, password, isValid, login]);

    // ======================
    // UI
    // ======================
    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.container}>
                <Text style={styles.logo}>🐾 Hurma</Text>
                <Text style={styles.subtitle}>Veteriner & Pet Asistanı</Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="E-posta"
                        placeholderTextColor={colors.muted}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Şifre"
                        placeholderTextColor={colors.muted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[
                            styles.button,
                            (!isValid || loading) && styles.buttonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={!isValid || loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Giriş Yap</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.footer}>
                        Hesabın yok mu?{" "}
                        <Text
                            style={styles.footerLink}
                            onPress={() => navigation.navigate("Register")}
                        >
                            Kayıt Ol
                        </Text>
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

// ======================
// STYLES
// ======================
const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    logo: {
        fontSize: 44,
        fontWeight: "900",
        color: colors.primary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.muted,
        marginBottom: 36,
    },
    form: {
        width: "100%",
        maxWidth: 360,
    },
    input: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        marginBottom: 14,
        color: colors.text,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 6,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 16,
    },
    footer: {
        textAlign: "center",
        marginTop: 18,
        color: colors.muted,
        fontSize: 14,
    },
    footerLink: {
        color: colors.primary,
        fontWeight: "700",
    },
});
