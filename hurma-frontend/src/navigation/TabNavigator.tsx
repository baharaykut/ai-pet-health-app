import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import colors from "../theme/colors";

// 🔥 STACKLER
import AdoptionStack from "./AdoptionStack";
import HealthAIStack from "./HealthAIStack";
import HomeStack from "./HomeStack";
import ProductsStack from "./ProductsStack";
import ProfileStack from "./ProfileStack";

// 🧭 SCREEN
import VetsScreen from "../screens/VetsScreen";

/* ================= TYPES ================= */

export type TabParamList = {
    Home: undefined;
    Products: undefined;
    Vets: undefined;
    Adoption: undefined;
    HealthAI: undefined;
    Profile: undefined;
};

/* ================= TAB ================= */

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,

                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.muted,

                tabBarStyle: {
                    position: "absolute",
                    bottom: 10,
                    left: 12,
                    right: 12,
                    height: 70,
                    borderRadius: 22,
                    backgroundColor: "#FFFFFF",
                    paddingBottom: 8,
                    paddingTop: 8,
                    elevation: 20,
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    borderTopWidth: 0,
                },

                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },

                tabBarItemStyle: {
                    marginTop: 2,
                },

                tabBarIcon: ({ color, focused }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    switch (route.name) {
                        case "Home":
                            iconName = focused ? "home" : "home-outline";
                            break;
                        case "Products":
                            iconName = focused ? "cart" : "cart-outline";
                            break;
                        case "Vets":
                            iconName = focused ? "medkit" : "medkit-outline";
                            break;
                        case "Adoption":
                            iconName = focused ? "paw" : "paw-outline";
                            break;
                        case "HealthAI":
                            iconName = focused ? "analytics" : "analytics-outline";
                            break;
                        case "Profile":
                            iconName = focused ? "person" : "person-outline";
                            break;
                        default:
                            iconName = "ellipse-outline";
                    }

                    const size = route.name === "HealthAI" ? 28 : 24;
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{ title: "Ana Sayfa" }}
            />

            <Tab.Screen
                name="Products"
                component={ProductsStack}
                options={{ title: "Ürünler" }}
            />

            <Tab.Screen
                name="Vets"
                component={VetsScreen}
                options={{ title: "Veteriner" }}
            />

            <Tab.Screen
                name="Adoption"
                component={AdoptionStack}
                options={{ title: "Sahiplendirme" }}
            />

            <Tab.Screen
                name="HealthAI"
                component={HealthAIStack}
                options={{ title: "AI Analiz" }}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{ title: "Profil" }}
            />
        </Tab.Navigator>
    );
}
