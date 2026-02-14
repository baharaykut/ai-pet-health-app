import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import turkey from "../data/turkey.json";
import { RootStackParamList } from "../navigation/AppNavigator";
import api from "../services/api";

const DefaultVetImage = require("../../assets/vet-default.png");

interface Vet {
    id: string | number;
    name: string;
    address: string;
    phone: string;
    rating: number;
    photoUrl: string | null;
    distanceKm: number;
    latitude: number;
    longitude: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Appointment">;
type SortKey = "distance" | "rating" | "name";

// =======================
// UTILS
// =======================

function safeNumber(v: any, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

// 🌍 GERÇEK MESAFE HESABI (HAVERSINE)
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function openGoogleMaps(lat: number, lng: number) {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
}

function callPhone(phone?: string) {
    if (!phone) {
        Alert.alert("Bilgi", "Bu veteriner için telefon numarası yok.");
        return;
    }
    Linking.openURL(`tel:${phone}`);
}

// =======================
// JSON HELPERS
// =======================

const cities = turkey as any[];

function parseCoord(coordStr?: string) {
    if (!coordStr) return null;
    const parts = coordStr.split(",").map((x) => Number(x.trim()));
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
    return { lat: parts[0], lng: parts[1] };
}

function findCityCenter(cityName: string) {
    const city = cities.find((c) => c.Province === cityName);
    if (!city) return null;
    return parseCoord(city.Coordinates);
}

function findDistrictCenter(cityName: string, districtName: string) {
    const city = cities.find((c) => c.Province === cityName);
    if (!city) return null;

    const dist = city.Districts.find((d: any) => d.District === districtName);
    if (!dist) return null;

    return parseCoord(dist.Coordinates);
}

// =======================

export default function VetsScreen() {
    const navigation = useNavigation<NavigationProp>();

    const [loading, setLoading] = useState(true);

    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null); // 🔍 Arama merkezi
    const [myGps, setMyGps] = useState<{ lat: number; lng: number } | null>(null); // 📍 GERÇEK KONUM

    const [vetsRaw, setVetsRaw] = useState<Vet[]>([]);

    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("distance");

    // =======================
    // City / District lists
    // =======================

    const cityOptions = useMemo(() => ["", ...cities.map((c) => c.Province)], []);

    const districtOptions = useMemo(() => {
        if (!city) return [""];
        const cityObj = cities.find((c) => c.Province === city);
        if (!cityObj) return [""];
        return ["", ...cityObj.Districts.map((d: any) => d.District)];
    }, [city]);

    // =======================
    // GPS
    // =======================

    const getGps = useCallback(async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                Alert.alert("Uyarı", "Konum izni yok, varsayılan konum kullanılıyor.");
                const fallback = { lat: 40.14, lng: 29.98 };
                setMyGps(fallback);
                setCoords(fallback);
                return;
            }

            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const userPos = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };

            setMyGps(userPos);   // 🔥 GERÇEK KONUM
            setCoords(userPos);  // 🔍 İlk açılışta arama merkezi
        } catch {
            const fallback = { lat: 40.14, lng: 29.98 };
            setMyGps(fallback);
            setCoords(fallback);
        }
    }, []);

    // =======================
    // API
    // =======================

    const loadVetsByLatLng = async (lat: number, lng: number) => {
        try {
            setLoading(true);

            const res = await api.get<Vet[]>("/api/Vets/nearby", {
                params: { lat, lng },
            });

            const list = Array.isArray(res.data) ? res.data : [];

            // 🔥🔥🔥 ASIL OLAY: MESAFE HER ZAMAN BENİM GPS'TEN HESAPLANIYOR
            const fixed = list.map((v) => {
                let dist = v.distanceKm;

                if (myGps) {
                    dist = haversineKm(
                        myGps.lat,
                        myGps.lng,
                        v.latitude,
                        v.longitude
                    );
                }

                return {
                    ...v,
                    distanceKm: dist,
                };
            });

            setVetsRaw(fixed);
        } catch {
            Alert.alert("Hata", "Veterinerler yüklenemedi");
        } finally {
            setLoading(false);
        }
    };

    // =======================

    useEffect(() => {
        getGps();
    }, []);

    useEffect(() => {
        if (coords) loadVetsByLatLng(coords.lat, coords.lng);
    }, [coords, myGps]);

    // =======================
    // City/District selection
    // =======================

    const onSelectCity = async (c: string) => {
        setCity(c);
        setDistrict("");

        if (!c) return;

        const loc = findCityCenter(c);
        if (!loc) return Alert.alert("Hata", "Şehir koordinatı bulunamadı");

        setCoords(loc); // 🔍 SADECE ARAMA MERKEZİ DEĞİŞİYOR
    };

    const onSelectDistrict = async (d: string) => {
        setDistrict(d);

        if (!city || !d) return;

        const loc = findDistrictCenter(city, d);
        if (!loc) return Alert.alert("Hata", "İlçe koordinatı bulunamadı");

        setCoords(loc); // 🔍 SADECE ARAMA MERKEZİ
    };

    // =======================

    const vets = useMemo(() => {
        let list = [...vetsRaw];

        if (sortKey === "distance") list.sort((a, b) => safeNumber(a.distanceKm) - safeNumber(b.distanceKm));
        else if (sortKey === "rating") list.sort((a, b) => safeNumber(b.rating) - safeNumber(a.rating));
        else list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "tr"));

        return list;
    }, [vetsRaw, sortKey]);

    const resolveImage = (vet: Vet) => {
        if (vet.photoUrl?.startsWith("http")) return { uri: vet.photoUrl };
        return DefaultVetImage;
    };

    // =======================

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🐾 Veteriner Bul</Text>

            {/* FILTERS */}
            <View style={styles.filters}>
                <View style={styles.pickerWrap}>
                    <Picker selectedValue={city} onValueChange={(v) => onSelectCity(String(v))}>
                        <Picker.Item label="İl Seç" value="" />
                        {cityOptions.map((c) => (
                            <Picker.Item key={c || "x"} label={c} value={c} />
                        ))}
                    </Picker>
                </View>

                <View style={styles.pickerWrap}>
                    <Picker selectedValue={district} onValueChange={(v) => onSelectDistrict(String(v))}>
                        <Picker.Item label="İlçe Seç" value="" />
                        {districtOptions.map((d) => (
                            <Picker.Item key={d || "y"} label={d} value={d} />
                        ))}
                    </Picker>
                </View>

                <TouchableOpacity style={styles.locationBtn} onPress={getGps}>
                    <Text style={{ color: "#fff", fontWeight: "900" }}>📍 Benim Konumum</Text>
                </TouchableOpacity>
            </View>

            {/* LIST */}
            <FlatList
                data={vets}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={resolveImage(item)} style={styles.image} />

                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.address} numberOfLines={1}>
                                {item.address || "Adres yok"}
                            </Text>

                            <View style={styles.metaRow}>
                                <Text style={styles.rating}>⭐ {safeNumber(item.rating).toFixed(1)}</Text>
                                <Text style={styles.distance}>📍 {safeNumber(item.distanceKm).toFixed(2)} km</Text>
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.callBtn} onPress={() => callPhone(item.phone)}>
                                    <Text style={styles.callText}>📞 Ara</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.mapBtn}
                                    onPress={() => openGoogleMaps(item.latitude, item.longitude)}
                                >
                                    <Text style={styles.mapText}>🗺️ Yol Tarifi</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

// =======================
// STYLES
// =======================

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#f8f9fb" },
    title: { fontSize: 26, fontWeight: "900", marginBottom: 10 },

    filters: { gap: 10, marginBottom: 10 },

    pickerWrap: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#eee",
    },

    locationBtn: {
        backgroundColor: "#6c5ce7",
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        marginBottom: 16,
        overflow: "hidden",
        elevation: 4,
    },

    image: { width: "100%", height: 200, backgroundColor: "#eee" },

    info: { padding: 14 },

    name: { fontSize: 20, fontWeight: "900" },

    address: { marginTop: 4, color: "#666", fontSize: 13 },

    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },

    rating: { color: "#ff9800", fontWeight: "900", fontSize: 15 },

    distance: { fontWeight: "800", color: "#444" },

    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },

    callBtn: {
        flex: 1,
        marginRight: 8,
        backgroundColor: "#2ecc71",
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
    },

    callText: { color: "#fff", fontWeight: "900" },

    mapBtn: {
        flex: 1,
        marginLeft: 8,
        backgroundColor: "#6c5ce7",
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
    },

    mapText: { color: "#fff", fontWeight: "900" },

    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
