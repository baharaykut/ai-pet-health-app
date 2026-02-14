import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import AddPetScreen from "../screens/AddPetScreen";
import AddressesScreen from "../screens/AddressesScreen"; // ✅ LİSTE
import AddressFormScreen from "../screens/AddressFormScreen"; // ✅ FORM
import AIHistoryScreen from "../screens/AIHistoryScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import OrdersScreen from "../screens/OrdersScreen";
import PetDetailsScreen from "../screens/PetDetailsScreen";
import PetEditScreen from "../screens/PetEditScreen";
import ProfileEditScreen from "../screens/ProfileEditScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";

/* ================= TYPES ================= */

export type ProfileStackParamList = {
    ProfileHome: undefined;
    ProfileEdit: undefined;
    Settings: undefined;
    ChangePassword: undefined;
    Orders: undefined;
    AIHistory: { petId: number };
    PetDetails: { petId: number };
    PetEdit: { petId: number };
    AddPet: undefined;

    // 📍 ADRES AKIŞI
    Addresses: undefined;        // liste
    AddressCreate: undefined;    // form
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/* ================= STACK ================= */

export default function ProfileStack() {
    return (
        <Stack.Navigator
            initialRouteName="ProfileHome"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="ProfileHome" component={ProfileScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="AIHistory" component={AIHistoryScreen} />
            <Stack.Screen name="PetDetails" component={PetDetailsScreen} />
            <Stack.Screen name="PetEdit" component={PetEditScreen} />
            <Stack.Screen name="AddPet" component={AddPetScreen} />

            {/* 📍 ADRESLER */}
            <Stack.Screen
                name="Addresses"
                component={AddressesScreen}
            />

            <Stack.Screen
                name="AddressCreate"
                component={AddressFormScreen}
            />
        </Stack.Navigator>
    );
}
