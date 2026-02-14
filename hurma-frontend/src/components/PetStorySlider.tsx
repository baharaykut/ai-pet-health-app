import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import colors from "../theme/colors";

/* ================= TYPES ================= */

export type StoryItem = {
    id: number;
    mediaUrl: string;          // ✅ TEK KAYNAK (HomeScreen ile uyumlu)
    isVideo?: boolean;
    caption?: string;
    createdAt?: string;
    likeCount?: number;
    commentCount?: number;
};

type Props = {
    stories: StoryItem[];
    onAddPress?: () => void;
    onPress?: (story: StoryItem) => void;
};

/* ================= COMPONENT ================= */

export default function PetStorySlider({
    stories,
    onAddPress,
    onPress,
}: Props) {
    return (
        <View style={styles.container}>
            {/* ➕ ADD STORY */}
            {onAddPress && (
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={onAddPress}
                    activeOpacity={0.85}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            )}

            {/* STORY LIST */}
            <FlatList
                data={stories}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <StoryBubble
                        story={item}
                        onPress={() => onPress?.(item)}
                    />
                )}
            />
        </View>
    );
}

/* ================= STORY ITEM ================= */

function StoryBubble({
    story,
    onPress,
}: {
    story: StoryItem;
    onPress?: () => void;
}) {
    const [failed, setFailed] = useState(false);

    return (
        <TouchableOpacity
            style={styles.storyItem}
            onPress={onPress}
            activeOpacity={0.85}
        >
            {failed ? (
                <View style={styles.fallbackBox}>
                    <Ionicons
                        name="paw"
                        size={30}
                        color={colors.primary}
                    />
                </View>
            ) : (
                <Image
                    source={{ uri: story.mediaUrl }} // ✅ ARTIK DOĞRU
                    style={styles.storyImage}
                    resizeMode="cover"
                    onError={() => setFailed(true)}
                />
            )}
        </TouchableOpacity>
    );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: {
        height: 120,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },

    listContent: {
        paddingHorizontal: 12,
        alignItems: "center",
    },

    storyItem: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 14,
        overflow: "hidden",
        backgroundColor: "#fff",
        elevation: 3,
    },

    storyImage: {
        width: "100%",
        height: "100%",
    },

    fallbackBox: {
        flex: 1,
        backgroundColor: "#F0E6E0",
        alignItems: "center",
        justifyContent: "center",
    },

    addButton: {
        marginLeft: 12,
        marginRight: 6,
        backgroundColor: colors.primary,
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
    },
});
