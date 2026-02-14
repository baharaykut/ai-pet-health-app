import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

/* ================= AUTH ================= */
import LoginScreen from "../screens/LoginScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import RegisterScreen from "../screens/RegisterScreen";

/* ================= MAIN ================= */
import TabNavigator from "./TabNavigator";

/* ================= VET ================= */
import AppointmentScreen from "../screens/AppointmentScreen";

/* ================= PET ================= */
import AddPetScreen from "../screens/AddPetScreen";
import PetDetailsScreen from "../screens/PetDetailsScreen";
import PetEditScreen from "../screens/PetEditScreen";

/* ================= AI ================= */
import AIAnalyzeScreen from "../screens/AIAnalyzeScreen";
import AIHistoryDetailScreen from "../screens/AIHistoryDetailScreen"; // ✅ EKLENDİ
import AIHistoryScreen from "../screens/AIHistoryScreen";
import AIPetSelectScreen from "../screens/AIPetSelectScreen";
import AIResultScreen from "../screens/AIResultScreen";

/* ================= STORY ================= */
import StoryUploadScreen from "../screens/StoryUploadScreen";

/* ================= TYPES ================= */

export type AIBackendResult = {
    success: boolean;
    species?: {
        name: string;
        confidence: number;
    };
    skinDisease?: {
        name: string;
        confidence: number;
    };
    summary?: {
        animal: string;
        disease?: string;
        confidence?: number;
        riskLevel?: "LOW" | "MEDIUM" | "HIGH";
        message?: string;
    };
    yoloDetections?: {
        class: string;
        confidence: number;
    }[];
};

export type RootStackParamList = {
    Onboarding: undefined;
    Login: undefined;
    Register: undefined;
    MainTabs: undefined;

    Appointment: { vetName: string };

    AddPet: undefined;
    PetDetails: { petId: number };
    PetEdit: { petId: number };

    /* ================= AI ================= */
    AIPetSelect: undefined;
    HealthAI: { petId?: number };
    AIHistory: { petId?: number };
    AIHistoryDetail: { analysisId: number }; // ✅ EKLENDİ
    AIResult: {
        petId?: number;
        result: AIBackendResult;
        photoUri?: string;
    };

    /* ================= STORY ================= */
    StoryUpload: { userId?: number; petId?: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Onboarding"
                screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                }}
            >
                {/* ================= AUTH ================= */}
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />

                {/* ================= MAIN ================= */}
                <Stack.Screen name="MainTabs" component={TabNavigator} />

                {/* ================= VET ================= */}
                <Stack.Screen name="Appointment" component={AppointmentScreen} />

                {/* ================= PET ================= */}
                <Stack.Screen name="AddPet" component={AddPetScreen} />
                <Stack.Screen name="PetDetails" component={PetDetailsScreen} />
                <Stack.Screen name="PetEdit" component={PetEditScreen} />

                {/* ================= AI ================= */}
                <Stack.Screen name="AIPetSelect" component={AIPetSelectScreen} />
                <Stack.Screen name="HealthAI" component={AIAnalyzeScreen} />
                <Stack.Screen name="AIHistory" component={AIHistoryScreen} />
                <Stack.Screen name="AIHistoryDetail" component={AIHistoryDetailScreen} /> {/* ✅ EKLENDİ */}
                <Stack.Screen name="AIResult" component={AIResultScreen} />

                {/* ================= STORY ================= */}
                <Stack.Screen name="StoryUpload" component={StoryUploadScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
