import api from "./api";

export type Story = {
    id: number;
    text: string;
    imageUrl?: string;
    userName: string;
    petName: string;
    likeCount: number;
    commentCount: number;
};

export async function fetchStories() {
    const res = await api.get<Story[]>("/api/Story");
    return res.data;
}
