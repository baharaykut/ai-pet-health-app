import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { AddressDto, userService } from "../services/userService";

export default function AddressesScreen({ navigation, route }: any) {
    const selectMode = route?.params?.select === true;

    const [addresses, setAddresses] = useState<AddressDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            const res = await userService.listAddresses();
            setAddresses(res ?? []);
        } catch {
            Alert.alert("Hata", "Adresler yüklenemedi");
        } finally {
            setLoading(false);
        }
    };

    // 🔄 EKRANA HER GELİNDİĞİNDE YENİLE
    useFocusEffect(
        useCallback(() => {
            loadAddresses();
        }, [])
    );

    // 🔃 AŞAĞI ÇEK YENİLE
    const onRefresh = async () => {
        setRefreshing(true);
        await loadAddresses();
        setRefreshing(false);
    };

    const remove = (id: number) => {
        Alert.alert("Sil", "Bu adres silinsin mi?", [
            { text: "İptal", style: "cancel" },
            {
                text: "Sil",
                style: "destructive",
                onPress: async () => {
                    await userService.deleteAddress(id);
                    loadAddresses();
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Adreslerim</Text>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 30 }} />
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={(i) => i.id.toString()}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    ListEmptyComponent={
                        <Text style={styles.empty}>
                            Henüz kayıtlı adres yok
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.bold}>{item.title}</Text>
                            <Text>{item.fullName}</Text>
                            <Text>{item.city} / {item.district}</Text>
                            <Text>{item.detail}</Text>

                            {!selectMode && (
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => remove(item.id)}
                                >
                                    <Text style={styles.deleteText}>Sil</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                />
            )}

            {/* ➕ FLOATING ADD BUTTON */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("AddressCreate")}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },

    empty: {
        textAlign: "center",
        marginTop: 40,
        color: "#666",
    },

    card: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ddd",
    },

    bold: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 2,
    },

    deleteBtn: {
        marginTop: 8,
        alignSelf: "flex-start",
    },

    deleteText: {
        color: "red",
        fontWeight: "600",
    },

    fab: {
        position: "absolute",
        right: 20,
        bottom: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#4CAF50",
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
    },
});
