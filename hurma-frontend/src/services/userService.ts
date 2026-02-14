import api from "./api";

export type AddressDto = {
    id: number;
    title: string;
    fullName: string;
    phone: string;
    city: string;
    district: string;
    detail: string;
};

export type AddressCreateDto = {
    title: string;
    fullName: string;
    phone: string;
    city: string;
    district: string;
    detail: string;
};

export const userService = {
    // 📍 Kullanıcının kendi adresleri
    async listAddresses(): Promise<AddressDto[]> {
        const res = await api.get("/api/addresses/my");
        return res.data;
    },

    // ➕ Yeni adres
    async createAddress(payload: AddressCreateDto): Promise<AddressDto> {
        const res = await api.post("/api/addresses", payload);
        return res.data;
    },

    // ✏️ Adres güncelle
    async updateAddress(
        id: number,
        payload: AddressCreateDto
    ): Promise<void> {
        await api.put(`/api/addresses/${id}`, payload);
    },

    // 🗑 Adres sil
    async deleteAddress(id: number): Promise<void> {
        await api.delete(`/api/addresses/${id}`);
    },
};
