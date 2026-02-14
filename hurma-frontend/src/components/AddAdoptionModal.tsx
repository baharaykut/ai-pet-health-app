import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import colors from "../theme/colors";

interface AddAdoptionModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (newItem: any) => void;
}

export default function AddAdoptionModal({
    visible,
    onClose,
    onAdd,
}: AddAdoptionModalProps) {
    const [form, setForm] = useState({
        name: "",
        type: "",
        breed: "",
        location: "",
        description: "",
        contact: "",
        photoUrl: "",
    });

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleSubmit = () => {
        if (!form.name || !form.type || !form.contact) {
            alert("Lütfen gerekli alanları doldur 🐾");
            return;
        }
        onAdd({ id: Date.now(), ...form });
        setForm({
            name: "",
            type: "",
            breed: "",
            location: "",
            description: "",
            contact: "",
            photoUrl: "",
        });
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.title}>🐶 Yeni İlan</Text>

                        {/* INPUTS */}
                        {["name", "type", "breed", "location", "contact", "photoUrl"].map((field) => (
                            <TextInput
                                key={field}
                                style={styles.input}
                                placeholder={
                                    field === "name"
                                        ? "İsim"
                                        : field === "type"
                                            ? "Tür (Kedi, Köpek...)"
                                            : field === "breed"
                                                ? "Cins"
                                                : field === "location"
                                                    ? "Konum"
                                                    : field === "contact"
                                                        ? "İletişim"
                                                        : "Fotoğraf URL"
                                }
                                placeholderTextColor={colors.muted}
                                value={(form as any)[field]}
                                onChangeText={(v) => handleChange(field, v)}
                            />
                        ))}

                        {/* Description */}
                        <TextInput
                            style={[styles.input, { height: 100 }]}
                            placeholder="Açıklama"
                            placeholderTextColor={colors.muted}
                            multiline
                            value={form.description}
                            onChangeText={(v) => handleChange("description", v)}
                        />

                        {/* BUTTONS */}
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancel]}>
                                <Text style={styles.btnTextCancel}>İptal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleSubmit} style={[styles.button, styles.submit]}>
                                <Text style={styles.btnText}>Ekle</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modal: {
        width: "90%",
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 20,
        maxHeight: "80%",

        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 16,
        color: colors.text,
    },
    input: {
        backgroundColor: "#F0E6E0",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
        fontSize: 15,
        color: colors.text,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginHorizontal: 6,
    },
    cancel: {
        backgroundColor: "#E0D2CC",
    },
    submit: {
        backgroundColor: colors.primary,
    },
    btnText: {
        color: "#fff",
        fontWeight: "700",
    },
    btnTextCancel: {
        color: colors.text,
        fontWeight: "600",
    },
});
