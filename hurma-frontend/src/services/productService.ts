import api from "./api";

export const productService = {
    async getAll() {
        const res = await api.get("/api/products");
        return res.data;
    },

    async getById(id: number) {
        const res = await api.get(`/api/products/${id}`);
        return res.data;
    },
};

export default productService;
