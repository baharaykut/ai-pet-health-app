import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../theme/colors";

interface BoneButtonProps {
    onPress: () => void;
}

export default function BoneButton({ onPress }: BoneButtonProps) {
    return (
        <TouchableOpacity style={styles.boneButton} onPress={onPress}>
            <View style={styles.boneShape}>
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.text}>İlan Ver</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    boneButton: {
        position: "absolute",
        right: 25,
        bottom: 25,
        zIndex: 999,
    },
    boneShape: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 26,
        paddingVertical: 16,
        borderRadius: 40,

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    text: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 8,
    },
});
