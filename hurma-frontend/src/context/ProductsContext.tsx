// context/ProductsContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    rating: number;
    reviewCount: number;
    stock: number;
    image?: string;
}

interface ProductsContextType {
    products: Product[];
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([
        {
            id: '1',
            name: 'Kedi Maması Premium',
            category: 'Mama',
            price: 149.99,
            rating: 4.2,
            reviewCount: 128,
            stock: 50,
        },
        // ... diğer ürünler
    ]);

    const addProduct = (productData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            ...productData,
            id: Date.now().toString(),
        };
        setProducts([newProduct, ...products]);
    };

    const updateProduct = (id: string, updates: Partial<Product>) => {
        setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const deleteProduct = (id: string) => {
        setProducts(products.filter(p => p.id !== id));
    };

    return (
        <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
            {children}
        </ProductsContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductsContext);
    if (!context) {
        throw new Error('useProducts must be used within ProductsProvider');
    }
    return context;
};