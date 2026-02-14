import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import AddAdoption from "../screens/AddAdoption";
import AdoptionDetailScreen from "../screens/AdoptionDetailScreen";
import AdoptionScreen from "../screens/AdoptionScreen";
import EditAdoptionScreen from "../screens/EditAdoptionScreen";

// ======================================================
// 📦 MODEL
// ======================================================
export type Adoption = {
    id: number;
    name?: string;
    type?: string;
    breed?: string;
    location?: string;
    description?: string;
    contact?: string;
    photoUrl?: string;
};

// ======================================================
// 🧭 NAV PARAMS
// ======================================================
export type AdoptionStackParamList = {
    AdoptionHome: undefined;

    // ✅ SADECE ID GÖNDERİYORUZ
    AdoptionDetail: { id: number };

    AddAdoption: undefined;

    // Edit yine obje alabilir
    EditAdoption: { adoption: Adoption };
};

const Stack = createNativeStackNavigator<AdoptionStackParamList>();

export default function AdoptionStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdoptionHome" component={AdoptionScreen} />
            <Stack.Screen name="AdoptionDetail" component={AdoptionDetailScreen} />
            <Stack.Screen name="AddAdoption" component={AddAdoption} />
            <Stack.Screen name="EditAdoption" component={EditAdoptionScreen} />
        </Stack.Navigator>
    );
}
