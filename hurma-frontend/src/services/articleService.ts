import api from "./api";

export type Article = {
    id: number;
    title: string;
    summary: string;
    content: string;
    imageUrl: string | null;
    createdAt: string;
};

export async function fetchArticles() {
    const res = await api.get<Article[]>("/api/Articles");
    return res.data;
}
