import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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
    const tabBarHeight = useBottomTabBarHeight();

    const [addresses, setAddresses] = useState<AddressDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // 🔄 ADRESLERİ YÜKLE
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

    // 🔥 EKRAN HER AÇILDIĞINDA YENİLE
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

    // 📦 CHECKOUT SEÇİMİ
    const onSelect = (address: AddressDto) => {
        if (!selectMode) return;

        navigation.navigate("Checkout", {
            addressId: address.id,
        });
    };

    // ✏️ ADRES DÜZENLE
    const onEdit = (address: AddressDto) => {
        navigation.navigate("AddressCreate", {
            address,
        });
    };

    // 🗑 ADRES SİL
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
                        <TouchableOpacity
                            style={[
                                styles.card,
                                selectMode && styles.selectable,
                            ]}
                            onPress={() =>
                                selectMode ? onSelect(item) : onEdit(item)
                            }
                        >
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
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* ➕ FLOATING YENİ ADRES EKLE */}
            <TouchableOpacity
                style={[
                    styles.fab,
                    { bottom: tabBarHeight + 20 },
                ]}
                onPress={() => navigation.navigate("AddressCreate")}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#F6F6F6",
    },

    title: {
        fontSize: 22,
        fontWeight: "900",
        marginBottom: 12,
    },

    empty: {
        textAlign: "center",
        marginTop: 40,
        color: "#777",
    },

    card: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#ddd",
    },

    selectable: {
        borderColor: "#4CAF50",
    },

    bold: {
        fontWeight: "900",
        fontSize: 16,
        marginBottom: 2,
    },

    deleteBtn: {
        marginTop: 8,
        alignSelf: "flex-start",
    },

    deleteText: {
        color: "red",
        fontWeight: "700",
    },

    fab: {
        position: "absolute",
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#4CAF50",
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
    },
});
