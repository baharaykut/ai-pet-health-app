import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import VetChatListScreen from "../screens/vet/VetChatListScreen";
import VetChatScreen from "../screens/vet/VetChatScreen";
import VetDashboardScreen from "../screens/vet/VetDashboardScreen";

export type VetStackParamList = {
    VetDashboard: undefined;
    VetChatList: undefined;
    VetChat: { userId: number; userName?: string };
};

const Stack = createNativeStackNavigator<VetStackParamList>();

export default function VetNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="VetDashboard"
            screenOptions={{ headerShown: false, animation: "slide_from_right" }}
        >
            <Stack.Screen name="VetDashboard" component={VetDashboardScreen} />
            <Stack.Screen name="VetChatList" component={VetChatListScreen} />
            <Stack.Screen name="VetChat" component={VetChatScreen} />
        </Stack.Navigator>
    );
}
