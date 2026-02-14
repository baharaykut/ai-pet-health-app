import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import HomeScreen from "../screens/HomeScreen";
import PetDetailsScreen from "../screens/PetDetailsScreen";
import PetEditScreen from "../screens/PetEditScreen";

// ======================================================
// 🧭 NAV PARAM TYPES
// ======================================================
export type HomeStackParamList = {
    HomeMain: undefined;
    PetDetails: { petId: number };
    PetEdit: { petId: number };
};

// ======================================================
// 🧱 STACK
// ======================================================
const Stack = createNativeStackNavigator<HomeStackParamList>();

// ======================================================
// 🏠 HOME STACK
// ======================================================
export default function HomeStack() {
    return (
        <Stack.Navigator
            initialRouteName="HomeMain"
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="PetDetails" component={PetDetailsScreen} />
            <Stack.Screen name="PetEdit" component={PetEditScreen} />
        </Stack.Navigator>
    );
}
