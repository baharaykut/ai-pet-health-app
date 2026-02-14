import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import ProductDetailsScreen from "../screens/ProductDetailsScreen";
import ProductsScreen from "../screens/ProductsScreen";

export type ProductsStackParamList = {
    Products: undefined;
    ProductDetails: { product: any };
    Cart: undefined;
    Checkout: undefined;
};

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export default function ProductsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* 🔥 ANA LİSTE */}
            <Stack.Screen name="Products" component={ProductsScreen} />

            {/* 📦 DETAY */}
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />

            {/* 🛒 SEPET */}
            <Stack.Screen name="Cart" component={CartScreen} />

            {/* 💳 CHECKOUT */}
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
        </Stack.Navigator>
    );
}
