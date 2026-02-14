import api from "./api";

export interface CartItem {
    id: number;
    productId: number;
    quantity: number;
    product: {
        id: number;
        name: string;
        price: number;
        photoUrl: string; // ✅ DÜZELTİLDİ
    };
}


const cartService = {
    async getCart(): Promise<CartItem[]> {
        console.log("🛒 GET CART");
        const res = await api.get("/api/Cart");
        return res.data || [];
    },

    async addToCart(productId: number, quantity = 1): Promise<void> {
        console.log("🛒 ADD TO CART:", productId, quantity);
        await api.post("/api/Cart", { productId, quantity });
    },

    async updateQty(cartItemId: number, quantity: number): Promise<void> {
        console.log("🛒 UPDATE QTY:", cartItemId, quantity);
        await api.put(`/api/Cart/${cartItemId}`, { quantity });
    },

    async removeItem(cartItemId: number): Promise<void> {
        console.log("🛒 REMOVE ITEM:", cartItemId);
        await api.delete(`/api/Cart/${cartItemId}`);
    },

    async clear(): Promise<void> {
        console.log("🛒 CLEAR CART");
        await api.delete("/api/Cart/clear");
    },
};

export default cartService;
