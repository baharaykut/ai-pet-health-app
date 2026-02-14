import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ProfileStackParamList } from "../navigation/ProfileStack";
import colors from "../theme/colors";

type NavProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function SettingsScreen() {
    const navigation = useNavigation<NavProp>();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color={colors.text} />
                </TouchableOpacity>

                <Text style={styles.title}>Ayarlar</Text>

                <View style={{ width: 26 }} />
            </View>

            {/* CARD */}
            <View style={styles.card}>
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => navigation.navigate("ChangePassword")}
                >
                    <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={colors.primary}
                    />
                    <Text style={styles.itemText}>Şifre Değiştir</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
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
        marginTop: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    itemText: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
    },
});
