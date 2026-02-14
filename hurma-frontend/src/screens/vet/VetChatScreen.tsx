import { useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { fetchConversation, MessageDto, sendMessage } from "../../services/messages";
import colors from "../../theme/colors";

const TEMP_VET_USER_ID = 999;
// ✅ ŞİMDİLİK: vet'in userId'si yoksa 999 kullanıyoruz.
// Sonra AuthContext’ten gerçek userId çekeceğiz.

export default function VetChatScreen() {
    const route = useRoute<any>();
    const { userId, userName } = route.params || {};

    const [messages, setMessages] = useState<MessageDto[]>([]);
    const [text, setText] = useState("");
    const listRef = useRef<FlatList>(null);

    const load = async () => {
        const data = await fetchConversation(TEMP_VET_USER_ID, userId);
        setMessages(data);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const onSend = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        setText("");
        await sendMessage(TEMP_VET_USER_ID, userId, trimmed);

        // hızlı UI için local ekle
        const local: MessageDto = {
            id: Date.now(),
            fromUserId: TEMP_VET_USER_ID,
            toUserId: userId,
            text: trimmed,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, local]);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

        // sonra backend'den sync
        load();
    };

    const renderItem = ({ item }: { item: MessageDto }) => {
        const mine = item.fromUserId === TEMP_VET_USER_ID;
        return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.msgText, mine && { color: "#fff" }]}>{item.text}</Text>
                <Text style={[styles.time, mine && { color: "rgba(255,255,255,0.8)" }]}>
                    {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={80}
        >
            <Text style={styles.header}>🩺 {userName || `User #${userId}`}</Text>

            <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(i) => String(i.id)}
                renderItem={renderItem}
                contentContainerStyle={{ paddingVertical: 10 }}
            />

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Mesaj yaz…"
                    placeholderTextColor={colors.muted}
                    value={text}
                    onChangeText={setText}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
                    <Text style={styles.sendText}>Gönder</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    header: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 10 },

    bubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 14,
        marginBottom: 8,
    },
    mine: { alignSelf: "flex-end", backgroundColor: colors.primary },
    theirs: { alignSelf: "flex-start", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },

    msgText: { color: colors.text, fontSize: 15 },
    time: { marginTop: 6, fontSize: 11, color: colors.muted },

    inputRow: { flexDirection: "row", gap: 10, alignItems: "center", paddingTop: 10 },
    input: {
        flex: 1,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: colors.text,
    },
    sendBtn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14 },
    sendText: { color: "#fff", fontWeight: "800" },
});
