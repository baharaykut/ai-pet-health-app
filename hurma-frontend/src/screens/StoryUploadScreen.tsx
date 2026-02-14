// src/screens/StoryViewerScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/* 🌍 API */
const API_BASE =
    Platform.OS === "web"
        ? "http://localhost:5058"
        : "http://10.0.2.2:5058";

/* 🧠 TYPES */
type Story = {
    id: number;
    url: string;
    isVideo: boolean;
    likeCount?: number;
    commentCount?: number;
};

export default function StoryViewerScreen({ route, navigation }: any) {
    const { story, stories } = route.params as {
        story: Story;
        stories: Story[];
    };

    const startIndex = stories.findIndex((s) => s.id === story.id);

    const [index, setIndex] = useState(startIndex);
    const current = stories[index];

    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(current.likeCount ?? 0);
    const [commentCount, setCommentCount] = useState(
        current.commentCount ?? 0
    );

    const progress = useRef(new Animated.Value(0)).current;
    const videoRef = useRef<Video>(null);

    /* ⏳ PROGRESS BAR */
    const startProgress = () => {
        progress.setValue(0);
        Animated.timing(progress, {
            toValue: 1,
            duration: current.isVideo ? 8000 : 5000,
            useNativeDriver: false,
        }).start(() => nextStory());
    };

    useEffect(() => {
        setLoading(true);
        setLiked(false);
        setLikeCount(current.likeCount ?? 0);
        setCommentCount(current.commentCount ?? 0);
    }, [index]);

    /* ▶️ NEXT / PREV */
    const nextStory = () => {
        if (index < stories.length - 1) {
            setIndex((i) => i + 1);
        } else {
            navigation.goBack();
        }
    };

    const prevStory = () => {
        if (index > 0) setIndex((i) => i - 1);
    };

    /* ❤️ LIKE */
    const handleLike = async () => {
        if (liked) return;

        setLiked(true);
        setLikeCount((p) => p + 1);

        try {
            await fetch(
                `${API_BASE}/api/story/like?storyId=${current.id}&userId=1`,
                { method: "POST" }
            );
        } catch (e) {
            setLiked(false);
            setLikeCount((p) => p - 1);
        }
    };

    /* 💬 COMMENT */
    const handleSendComment = async () => {
        if (!comment.trim()) return;

        try {
            await fetch(
                `${API_BASE}/api/story/comment?storyId=${current.id}&userId=1&text=${encodeURIComponent(
                    comment
                )}`,
                { method: "POST" }
            );

            setComment("");
            setCommentCount((p) => p + 1);
        } catch (e) {
            console.log("Comment error:", e);
        }
    };

    return (
        <View style={styles.container}>
            {/* ⏳ PROGRESS */}
            <View style={styles.progressBg}>
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

            {/* TAP AREAS */}
            <TouchableOpacity style={styles.leftTap} onPress={prevStory} />
            <TouchableOpacity style={styles.rightTap} onPress={nextStory} />

            {/* ❌ CLOSE */}
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>

            {/* 📸 MEDIA */}
            {current.isVideo ? (
                <Video
                    ref={videoRef}
                    source={{ uri: current.url }}
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
                    source={{ uri: current.url }}
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

            {/* 🔻 FOOTER */}
            <View style={styles.footer}>
                {/* ❤️ LIKE */}
                <TouchableOpacity onPress={handleLike}>
                    <Ionicons
                        name={liked ? "heart" : "heart-outline"}
                        size={26}
                        color={liked ? "#ff4d4d" : "#fff"}
                    />
                    <Text style={styles.counter}>{likeCount}</Text>
                </TouchableOpacity>

                {/* 💬 COMMENT */}
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
                    <Text style={styles.counter}>{commentCount}</Text>
                </View>
            </View>
        </View>
    );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },

    media: {
        width: "100%",
        height: "100%",
    },

    loader: {
        position: "absolute",
        top: "50%",
    },

    progressBg: {
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

    leftTap: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "50%",
        zIndex: 5,
    },

    rightTap: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: "50%",
        zIndex: 5,
    },

    footer: {
        position: "absolute",
        bottom: 20,
        left: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
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
        marginRight: 6,
    },

    counter: {
        color: "#fff",
        fontSize: 12,
        marginTop: 2,
        textAlign: "center",
    },
});
