import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { RootStackParamList } from "../navigation/AppNavigator";

type AppointmentRouteProp = RouteProp<RootStackParamList, "Appointment">;

export default function AppointmentScreen() {
    const route = useRoute<AppointmentRouteProp>();
    const navigation = useNavigation<any>();
    const vetName = route.params?.vetName ?? "Bilinmeyen Veteriner";

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [date, setDate] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5058";

    const handleSubmit = async () => {
        if (!name || !phone) {
            Alert.alert("Eksik Bilgi", "Lütfen adınızı ve telefonunuzu giriniz.");
            return;
        }

        try {
            setLoading(true);

            const appointment = {
                vetId: 0,
                vetName,
                name,
                phone,
                date,
                notes,
            };

            await axios.post(`${API_BASE_URL}/api/Appointments`, appointment);

            Alert.alert("Başarılı 🎉", "Randevunuz kaydedildi!");
            navigation.goBack();
        } catch (error) {
            console.error("Randevu oluşturulamadı:", error);
            Alert.alert("Hata", "Randevu oluşturulamadı, tekrar deneyiniz.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ TYPESCRIPT SAFE onChange
    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🐾 Randevu Al</Text>
            <Text style={styles.vetName}>{vetName}</Text>

            <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="Telefon Numarası"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
            />

            <TouchableOpacity
                onPress={() => setShowPicker(true)}
                style={styles.dateButton}
            >
                <Text style={styles.dateText}>
                    📅 {date.toLocaleDateString()}{" "}
                    {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="datetime"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChangeDate}
                />
            )}

            <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Not (isteğe bağlı)"
                multiline
                value={notes}
                onChangeText={setNotes}
            />

            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Kaydediliyor..." : "Randevuyu Kaydet"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fb",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#ff8800",
        marginBottom: 8,
    },
    vetName: {
        fontSize: 18,
        color: "#444",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    dateButton: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        borderColor: "#ddd",
        borderWidth: 1,
        marginBottom: 12,
    },
    dateText: {
        color: "#333",
        fontSize: 16,
    },
    button: {
        backgroundColor: "#ff8800",
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
});
