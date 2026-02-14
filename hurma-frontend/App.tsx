import "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { StatusBar } from "react-native";

import AuthNavigator from "./src/navigation/AuthNavigator";
import { navigationRef } from "./src/navigation/navigationRef";

import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { PetProvider } from "./src/context/PetContext";
import { StoryProvider } from "./src/context/StoryContext";

function AppInner() {
    return (
        <NavigationContainer ref={navigationRef}>
            <StatusBar barStyle="dark-content" />
            <AuthNavigator />
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <PetProvider>
                <StoryProvider>
                    <CartProvider>
                        <AppInner />
                    </CartProvider>
                </StoryProvider>
            </PetProvider>
        </AuthProvider>
    );
}
