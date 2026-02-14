import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import AIAnalyzeScreen from "../screens/AIAnalyzeScreen";
import AIHistoryDetailScreen from "../screens/AIHistoryDetailScreen";
import AIHistoryScreen from "../screens/AIHistoryScreen";
import AIPetSelectScreen from "../screens/AIPetSelectScreen";
import AIResultScreen from "../screens/AIResultScreen";

/* ================= TYPES ================= */

export type HealthAIStackParamList = {
    AIPetSelect: undefined;

    Analyze: {
        petId: number;
        petName: string;
    };

    AIResult: {
        petId: number;
        result: any;
        photoUri: string;
    };

    AIHistory: {
        petId?: number; // ✅ opsiyonel yaptık
    };

    AIHistoryDetail: {
        analysisId: number;
    };
};

const Stack = createNativeStackNavigator<HealthAIStackParamList>();

/* ================= STACK ================= */

export default function HealthAIStack() {
    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="AIPetSelect"
        >
            <Stack.Screen name="AIPetSelect" component={AIPetSelectScreen} />
            <Stack.Screen name="Analyze" component={AIAnalyzeScreen} />
            <Stack.Screen name="AIResult" component={AIResultScreen} />
            <Stack.Screen name="AIHistory" component={AIHistoryScreen} />
            <Stack.Screen name="AIHistoryDetail" component={AIHistoryDetailScreen} />
        </Stack.Navigator>
    );
}
