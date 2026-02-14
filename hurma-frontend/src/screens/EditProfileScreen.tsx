import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import colors from "../theme/colors";

export default function EditProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profili Düzenle</Text>

            <TextInput placeholder="Ad Soyad" style={styles.input} />
            <TextInput placeholder="Kullanıcı Adı" style={styles.input} />
            <TextInput placeholder="Profil Fotoğrafı URL" style={styles.input} />

            <TouchableOpacity style={styles.saveBtn}>
                <Text style={styles.saveText}>Kaydet</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
    title: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    saveBtn: {
        marginTop: 10,
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    saveText: { color: "#fff", fontWeight: "700" },
});
