// src/store/cartMemory.ts

export let globalCartItems: any[] = [];

export const getCart = () => globalCartItems;

export const setCart = (items: any[]) => {
    globalCartItems = items;
};
