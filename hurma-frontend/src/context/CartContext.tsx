import React, {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from "react";

// Trendyol tarzı genişletilmiş ürün tipi
export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number; // İndirimli fiyat için orijinal fiyat
    category: string;
    photoUrl: string;
    seller?: string; // Satıcı bilgisi
    sellerRating?: number; // Satıcı puanı
    inCarts?: number; // Kaç kişinin sepetinde
    deliveryTime?: string; // Teslimat süresi
    size?: string; // Beden/boyut
    color?: string; // Renk
    rating?: number; // Ürün puanı
    reviewCount?: number; // Yorum sayısı
    savings?: number; // Kazanç miktarı
}

// Sepet elemanı (ürün + miktar + seçenekler)
export interface CartItem extends Product {
    quantity: number;
    selected?: boolean; // Sepette seçili mi?
}

// Context tipi
interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    increaseQuantity: (id: number) => void;
    decreaseQuantity: (id: number) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    toggleItemSelection: (id: number) => void;
    toggleAllSelection: (selected: boolean) => void;
    removeSelectedItems: () => void;
    getSelectedItems: () => CartItem[];
    getSelectedTotal: () => number;
    total: number;
    selectedTotal: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Ürünü sepete ekle
    const addToCart = (product: Product, quantity: number = 1) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? {
                            ...item,
                            quantity: item.quantity + quantity,
                            selected: item.selected !== undefined ? item.selected : true
                        }
                        : item
                );
            }
            return [...prev, {
                ...product,
                quantity,
                selected: true, // Varsayılan olarak seçili
                seller: product.seller || "Hurma Petshop",
                sellerRating: product.sellerRating || 9.2,
                inCarts: product.inCarts || Math.floor(Math.random() * 1000),
                deliveryTime: product.deliveryTime || "2 gün içinde",
                originalPrice: product.originalPrice || product.price * 1.2,
                savings: product.savings || Math.random() * 20,
            }];
        });
    };

    // Miktarı artır
    const increaseQuantity = (id: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    // Miktarı azalt
    const decreaseQuantity = (id: number) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.id === id
                        ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    // Ürünü sepetten kaldır
    const removeFromCart = (id: number) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    // Sepeti temizle
    const clearCart = () => setCart([]);

    // Ürün seçimini değiştir
    const toggleItemSelection = (id: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, selected: !item.selected } : item
            )
        );
    };

    // Tümünü seç/seçimi kaldır
    const toggleAllSelection = (selected: boolean) => {
        setCart((prev) =>
            prev.map((item) => ({ ...item, selected }))
        );
    };

    // Seçili ürünleri kaldır
    const removeSelectedItems = () => {
        setCart((prev) => prev.filter((item) => !item.selected));
    };

    // Seçili ürünleri getir
    const getSelectedItems = () => {
        return cart.filter(item => item.selected);
    };

    // Seçili ürünlerin toplam fiyatı
    const getSelectedTotal = () => {
        return cart
            .filter(item => item.selected)
            .reduce((acc, cur) => acc + cur.price * cur.quantity, 0);
    };

    // Toplam fiyat (tüm ürünler)
    const total = useMemo(
        () => cart.reduce((acc, cur) => acc + cur.price * cur.quantity, 0),
        [cart]
    );

    // Seçili ürünlerin toplamı
    const selectedTotal = useMemo(() => getSelectedTotal(), [cart]);

    // Toplam ürün adedi
    const itemCount = useMemo(
        () => cart.reduce((acc, cur) => acc + cur.quantity, 0),
        [cart]
    );

    const value = useMemo(
        () => ({
            cart,
            addToCart,
            increaseQuantity,
            decreaseQuantity,
            removeFromCart,
            clearCart,
            toggleItemSelection,
            toggleAllSelection,
            removeSelectedItems,
            getSelectedItems,
            getSelectedTotal,
            total,
            selectedTotal,
            itemCount,
        }),
        [cart, total, selectedTotal, itemCount]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context)
        throw new Error("❌ useCart must be used within a CartProvider");
    return context;
};