import api from "./api";

export type MessageDto = {
    id: number;
    fromUserId: number;
    toUserId: number;
    text: string;
    createdAt: string;
};

export async function fetchConversation(user1Id: number, user2Id: number) {
    const res = await api.get<MessageDto[]>(
        `/api/Messages/conversation?user1Id=${user1Id}&user2Id=${user2Id}`
    );
    return res.data;
}

export async function sendMessage(fromUserId: number, toUserId: number, text: string) {
    const res = await api.post(`/api/Messages`, {
        fromUserId,
        toUserId,
        text,
    });
    return res.data;
}
