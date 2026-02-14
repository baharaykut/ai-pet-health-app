import api from "./api";

export type FeedItem = {
    id: number;
    text: string;
    imageUrl?: string | null;
    userName?: string | null;
    petName?: string | null;
    likeCount: number;
    commentCount: number;
    isLikedByMe: boolean;
};

export async function fetchFeed(userId: number) {
    const res = await api.get<FeedItem[]>(`/api/community/feed?userId=${userId}`);
    return res.data;
}

export async function toggleLike(storyId: number, userId: number) {
    const res = await api.post(`/api/community/${storyId}/like?userId=${userId}`);
    return res.data as { storyId: number; likeCount: number; isLiked: boolean };
}

export async function addComment(storyId: number, userId: number, text: string) {
    const res = await api.post(`/api/community/${storyId}/comment?userId=${userId}`, { text });
    return res.data as { storyId: number; commentCount: number };
}

export async function fetchComments(storyId: number) {
    const res = await api.get(`/api/community/${storyId}/comments`);
    return res.data;
}
