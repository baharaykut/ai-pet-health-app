import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { orderService } from "../services/orderService";
import { AddressDto, userService } from "../services/userService";

// Address tipi
type Address = AddressDto;

export default function CheckoutScreen({ navigation }: any) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [creatingOrder, setCreatingOrder] = useState(false);

    // ================= LOAD ADDRESSES =================
    const load = async () => {
        try {
            setLoading(true);
            const list = await userService.listAddresses();
            setAddresses(Array.isArray(list) ? list : []);
        } catch (e: any) {
            Alert.alert(
                "Hata",
                e?.response?.data ?? e?.message ?? "Adresler alınamadı"
            );
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            const list = await userService.listAddresses();
            setAddresses(Array.isArray(list) ? list : []);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // ================= CREATE ORDER =================
    const onSelect = async (addressId: number) => {
        if (creatingOrder) return;

        try {
            setCreatingOrder(true);

            await orderService.createOrder(addressId);

            Alert.alert("✅ Sipariş alındı", "Sipariş başarıyla oluşturuldu", [
                {
                    text: "Tamam",
                    onPress: () => {
                        // ✅ TEK RESET – PROFİL > ORDERS
                        navigation.reset({
                            index: 0,
                            routes: [
                                {
                                    name: "Profile",
                                    state: {
                                        routes: [{ name: "Orders" }],
                                    },
                                },
                            ],
                        });
                    },
                },
            ]);
        } catch (e: any) {
            Alert.alert(
                "Hata",
                e?.response?.data ?? e?.message ?? "Sipariş oluşturulamadı"
            );
        } finally {
            setCreatingOrder(false);
        }
    };

    // ================= LOADING =================
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Adresler yükleniyor...</Text>
            </View>
        );
    }

    // ================= UI =================
    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Adres Seç</Text>

            <FlatList
                style={{ marginTop: 12 }}
                data={addresses}
                keyExtractor={(i) => i.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <Text style={{ marginTop: 20, color: "#666", textAlign: "center" }}>
                        Kayıtlı adres yok. Yeni adres ekleyin.
                    </Text>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        disabled={creatingOrder}
                        style={{
                            borderWidth: 1,
                            borderColor: "#ddd",
                            padding: 14,
                            borderRadius: 10,
                            marginBottom: 12,
                            backgroundColor: "#fff",
                            opacity: creatingOrder ? 0.6 : 1,
                        }}
                        onPress={() => onSelect(item.id)}
                    >
                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                            {item.title}
                        </Text>
                        <Text>
                            {item.fullName} • {item.phone}
                        </Text>
                        <Text>
                            {item.city} / {item.district}
                        </Text>
                        <Text>{item.detail}</Text>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity
                disabled={creatingOrder}
                style={{
                    backgroundColor: "#4CAF50",
                    padding: 14,
                    borderRadius: 10,
                    alignItems: "center",
                    marginTop: 6,
                    opacity: creatingOrder ? 0.6 : 1,
                }}
                // ✅ DOĞRU EKRAN ADI
                onPress={() => navigation.navigate("AddressForm")}
            >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    ➕ Yeni Adres Ekle
                </Text>
            </TouchableOpacity>
        </View>
    );
}
