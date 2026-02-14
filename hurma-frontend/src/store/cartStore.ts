import { create } from "zustand";

export type CartItem = {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
};

type CartState = {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    totalCount: () => number;
    totalPrice: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addToCart: (item) => {
        const items = get().items;
        const existing = items.find(i => i.id === item.id);

        if (existing) {
            set({
                items: items.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            });
        } else {
            set({
                items: [...items, { ...item, quantity: 1 }]
            });
        }
    },

    removeFromCart: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
    },

    clearCart: () => set({ items: [] }),

    totalCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

    totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
