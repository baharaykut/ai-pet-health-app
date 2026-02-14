import api from "./api";

export type Vet = {
    id: number;
    name: string;
    rating: number;
    isOnDuty: boolean;
    photoUrl: string;
};

export async function fetchVets() {
    const res = await api.get<Vet[]>("/api/Vets");
    return res.data;
}
