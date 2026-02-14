import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import OnboardingScreen from "../screens/OnboardingScreen";
import RoleSelectScreen from "../screens/RoleSelectScreen";
import SplashScreen from "../screens/SplashScreen";

import AuthStack from "./AuthStack";
import TabNavigator from "./TabNavigator";
import VetNavigator from "./VetNavigator";

export default function AuthNavigator() {
    const { token, role, loading, onboardingDone } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    // ✅ Her açılışta kısa splash göster (UX)
    useEffect(() => {
        const t = setTimeout(() => setShowSplash(false), 900);
        return () => clearTimeout(t);
    }, []);

    // 1) İlk yükleme + kısa splash
    if (loading || showSplash) return <SplashScreen />;

    // 2) Onboarding bitmediyse -> Onboarding
    if (!onboardingDone) return <OnboardingScreen />;

    // 3) Token yoksa -> Login/Register stack
    if (!token) return <AuthStack />;

    // 4) Token var ama role yok -> RoleSelect
    if (!role) return <RoleSelectScreen />;

    // 5) Role’a göre uygulama
    if (role === "VET") return <VetNavigator />;

    return <TabNavigator />;
}


