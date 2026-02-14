import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/* 🌍 API */
const API_BASE =
    Platform.OS === "web"
        ? "http://localhost:5058"
        : "http://10.0.2.2:5058";

export default function StoryViewerScreen({ route, navigation }: any) {
    const { story } = route.params;

    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [liked, setLiked] = useState(false);

    const videoRef = useRef<Video>(null);
    const progress = useRef(new Animated.Value(0)).current;

    /* ⏳ PROGRESS BAR */
    const startProgress = () => {
        Animated.timing(progress, {
            toValue: 1,
            duration: story.isVideo ? 8000 : 5000,
            useNativeDriver: false,
        }).start(() => {
            navigation.goBack();
        });
    };

    /* ❤️ LIKE */
    const handleLike = async () => {
        if (liked) return;
        setLiked(true);

        try {
            await fetch(
                `${API_BASE}/api/story/like?storyId=${story.id}&userId=1`,
                { method: "POST" }
            );
        } catch {
            setLiked(false);
        }
    };

    /* 💬 COMMENT */
    const handleSendComment = async () => {
        if (!comment.trim()) return;

        try {
            await fetch(
                `${API_BASE}/api/story/comment?storyId=${story.id}&userId=1&text=${encodeURIComponent(
                    comment
                )}`,
                { method: "POST" }
            );
            setComment("");
        } catch (e) {
            console.log("Comment error:", e);
        }
    };

    return (
        <View style={styles.container}>
            {/* ⏳ PROGRESS */}
            <View style={styles.progressContainer}>
                <Animated.View
                    style={[
                        styles.progressBar,
                        {
                            width: progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"],
                            }),
                        },
                    ]}
                />
            </View>

            {/* ❌ CLOSE */}
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>

            {/* 📸 MEDIA */}
            <View style={styles.mediaWrapper}>
                {story.isVideo ? (
                    <Video
                        ref={videoRef}
                        source={{ uri: story.url }}
                        style={styles.media}
                        shouldPlay
                        resizeMode={ResizeMode.COVER}
                        onLoad={() => {
                            setLoading(false);
                            startProgress();
                        }}
                    />
                ) : (
                    <Image
                        source={{ uri: story.url }}
                        style={styles.media}
                        resizeMode="cover"
                        onLoadEnd={() => {
                            setLoading(false);
                            startProgress();
                        }}
                    />
                )}

                {loading && (
                    <ActivityIndicator
                        size="large"
                        color="#fff"
                        style={styles.loader}
                    />
                )}
            </View>

            {/* 🔻 FOOTER */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={handleLike}>
                    <Ionicons
                        name={liked ? "heart" : "heart-outline"}
                        size={28}
                        color={liked ? "#ff4d4d" : "#fff"}
                    />
                </TouchableOpacity>

                <View style={styles.commentBox}>
                    <TextInput
                        placeholder="Yorum ekle..."
                        placeholderTextColor="#ccc"
                        style={styles.commentInput}
                        value={comment}
                        onChangeText={setComment}
                        returnKeyType="send"
                        onSubmitEditing={handleSendComment}
                    />
                    <TouchableOpacity onPress={handleSendComment}>
                        <Ionicons name="send" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },

    progressContainer: {
        position: "absolute",
        top: 20,
        left: 10,
        right: 10,
        height: 4,
        backgroundColor: "rgba(255,255,255,0.3)",
        borderRadius: 4,
        zIndex: 20,
    },

    progressBar: {
        height: "100%",
        backgroundColor: "#fff",
        borderRadius: 4,
    },

    closeButton: {
        position: "absolute",
        top: 40,
        right: 20,
        zIndex: 30,
    },

    mediaWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    media: {
        width: "100%",
        height: "100%",
    },

    loader: {
        position: "absolute",
        top: "50%",
    },

    footer: {
        position: "absolute",
        bottom: 20,
        left: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    commentBox: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 30,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 8,
    },

    commentInput: {
        flex: 1,
        color: "#fff",
        marginRight: 10,
    },
});
