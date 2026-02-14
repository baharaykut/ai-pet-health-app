import api from "./api";
import { AddressDto } from "./userService";

export interface OrderItem {
    productId: number;
    name: string;
    photoUrl: string;
    unitPrice: number;
    quantity: number;
}

export interface Order {
    id: number;
    total: number;
    createdAt: string;
    address: AddressDto;
    items: OrderItem[];
}

export const orderService = {
    async createOrder(addressId: number): Promise<Order> {
        const res = await api.post("/api/orders", { addressId });
        return res.data;
    },

    async getOrders(): Promise<Order[]> {
        const res = await api.get("/api/orders");
        return res.data;
    },

    async getOrderById(id: number): Promise<Order> {
        const res = await api.get(`/api/orders/${id}`);
        return res.data;
    }
};
