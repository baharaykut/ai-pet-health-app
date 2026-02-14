import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fetchVetRequests, VetRequestDto } from "../../services/vetRequests";
import colors from "../../theme/colors";

const TEMP_VET_ID = 1;

export default function VetChatListScreen() {
    const navigation = useNavigation<any>();
    const [items, setItems] = useState<VetRequestDto[]>([]);

    useEffect(() => {
        (async () => {
            const data = await fetchVetRequests(TEMP_VET_ID);
            setItems(data);
        })();
    }, []);

    const accepted = useMemo(() => items.filter(x => x.isAccepted), [items]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>💬 Mesajlar</Text>

            <FlatList
                data={accepted}
                keyExtractor={(i) => String(i.id)}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() =>
                            navigation.navigate("VetChat", {
                                userId: item.userId,
                                userName: `User #${item.userId}`,
                            })
                        }
                    >
                        <Text style={styles.title}>User #{item.userId}</Text>
                        <Text style={styles.sub} numberOfLines={1}>{item.question}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Henüz kabul edilmiş talep yok.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    header: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 10 },
    empty: { color: colors.muted, textAlign: "center", marginTop: 30 },

    row: {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },
    title: { fontWeight: "800", color: colors.text, marginBottom: 6 },
    sub: { color: colors.muted },
});
