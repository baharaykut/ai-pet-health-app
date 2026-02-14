import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import colors from "../theme/colors";

const slides = [
    {
        id: 1,
        title: "Evcil Dostun İçin Akıllı Asistan",
        desc: "Sağlık analizleri, veteriner bulma ve daha fazlası!",
        image: require("../../assets/onboarding1.png"),
    },
    {
        id: 2,
        title: "Anlık Sağlık Analizi",
        desc: "Fotoğrafla sağlık durumunu hızlıca analiz et.",
        image: require("../../assets/onboarding2.png"),
    },
    {
        id: 3,
        title: "Tüm Veriler Tek Yerde",
        desc: "Kayıt, aşı, beslenme bilgilerini kolayca takip et.",
        image: require("../../assets/onboarding3.png"),
    },
];

export default function OnboardingScreen() {
    const { completeOnboarding } = useAuth();
    const [index, setIndex] = useState(0);

    const handleNext = async () => {
        if (index < slides.length - 1) return setIndex(index + 1);
        await completeOnboarding(); // ✅ Root otomatik Login’e götürür
    };

    const slide = slides[index];

    return (
        <View style={styles.container}>
            <Image source={slide.image} style={styles.image} />
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.desc}>{slide.desc}</Text>

            <View style={styles.dots}>
                {slides.map((_, i) => (
                    <View key={i} style={[styles.dot, index === i && styles.activeDot]} />
                ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>
                    {index === slides.length - 1 ? "Hadi Başlayalım 🚀" : "Devam Et →"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24 },
    image: { width: "100%", height: 280, resizeMode: "contain" },
    title: { fontSize: 22, fontWeight: "700", color: colors.primary, textAlign: "center", marginTop: 20 },
    desc: { color: colors.text, textAlign: "center", marginTop: 8, fontSize: 15 },
    dots: { flexDirection: "row", marginTop: 20 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginHorizontal: 4 },
    activeDot: { backgroundColor: colors.primary },
    button: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 25, marginTop: 30 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

