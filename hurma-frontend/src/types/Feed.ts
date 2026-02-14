// src/types/Feed.ts

export type FeedPost = {
    id: number;
    userName: string;
    petName: string;
    text: string;
    likeCount: number;
    commentCount: number;
    likedByMe: boolean;
    createdAt: string;
};

export type FeedArticle = {
    id: number;
    title: string;
    summary: string;
    createdAt: string;
};

export type FeedItem =
    | { type: "post"; data: FeedPost }
    | { type: "article"; data: FeedArticle };
