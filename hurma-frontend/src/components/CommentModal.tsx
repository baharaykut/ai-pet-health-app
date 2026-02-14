import React, { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import colors from "../theme/colors";

export default function CommentModal({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const [text, setText] = useState("");

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.box}>
                    <Text style={styles.title}>Yorum ekle</Text>

                    <TextInput
                        placeholder="Ne düşünüyorsun?"
                        value={text}
                        onChangeText={setText}
                        style={styles.input}
                        multiline
                    />

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Gönder</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        padding: 20,
    },
    box: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 16,
    },
    title: {
        fontWeight: "700",
        marginBottom: 10,
    },
    input: {
        minHeight: 80,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 10,
        marginBottom: 12,
    },
    button: {
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 20,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
    },
});
