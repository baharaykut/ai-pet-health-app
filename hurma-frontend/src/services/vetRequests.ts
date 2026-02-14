import api from "./api";

export type VetRequestDto = {
    id: number;
    userId: number;
    vetId: number;
    question: string;
    isAccepted: boolean;
    createdAt: string;
};

export async function fetchVetRequests(vetId: number) {
    const res = await api.get<VetRequestDto[]>(`/api/VetRequests/vet/${vetId}`);
    return res.data;
}

export async function acceptVetRequest(id: number) {
    const res = await api.post(`/api/VetRequests/${id}/accept`, {});
    return res.data;
}

