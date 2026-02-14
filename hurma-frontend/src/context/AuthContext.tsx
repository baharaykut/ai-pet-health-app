import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import api, { setApiToken } from "../services/api";

export type UserRole = "USER" | "VET";

export type AuthUser = {
    id?: number;
    email?: string;
    role?: UserRole | string;
    name?: string;
    fullName?: string;
    phone?: string;
    city?: string;
    bio?: string;
    photoUrl?: string;
};

type AuthContextType = {
    token: string | null;
    role: UserRole | null;
    user: AuthUser | null;

    loading: boolean;

    onboardingDone: boolean;
    completeOnboarding: () => Promise<void>;
    resetOnboarding: () => Promise<void>;

    login: (token: string, role: UserRole | null) => Promise<void>;
    setRole: (role: UserRole) => Promise<void>;
    logout: () => Promise<void>;

    refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "token";
const ROLE_KEY = "role";
const ONBOARDING_KEY = "onboarding_done";
const USER_KEY = "auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setTokenState] = useState<string | null>(null);
    const [role, setRoleState] = useState<UserRole | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);

    const [onboardingDone, setOnboardingDone] = useState(false);
    const [loading, setLoading] = useState(true);

    // ⛔ Aynı anda 2 refreshMe çalışmasın
    const refreshingRef = useRef(false);

    // ======================
    // 🔁 REFRESH ME
    // ======================
    const refreshMe = async () => {
        if (refreshingRef.current) return;

        if (!token) {
            console.log("⚠️ refreshMe atlandı: token yok");
            return;
        }

        try {
            refreshingRef.current = true;

            const res = await api.get("/api/Auth/me");
            const u = res.data as AuthUser;

            console.log("✅ ME OK:", u);

            setUser(u);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));

            if (u?.role === "USER" || u?.role === "VET") {
                setRoleState(u.role);
                await AsyncStorage.setItem(ROLE_KEY, u.role);
            }
        } catch (e: any) {
            console.log("❌ refreshMe error:", e?.response?.status, e?.response?.data || e?.message);

            // ❗ SADECE 401 ise logout at
            if (e?.response?.status === 401) {
                console.log("🚨 TOKEN GEÇERSİZ — LOGOUT");
                await logout();
            }
        } finally {
            refreshingRef.current = false;
        }
    };

    // ======================
    // 🚀 BOOTSTRAP
    // ======================
    useEffect(() => {
        const bootstrap = async () => {
            try {
                const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
                const storedRole = await AsyncStorage.getItem(ROLE_KEY);
                const ob = await AsyncStorage.getItem(ONBOARDING_KEY);
                const storedUser = await AsyncStorage.getItem(USER_KEY);

                if (storedToken) {
                    console.log("🔐 Stored token bulundu");
                    setTokenState(storedToken);
                    setApiToken(storedToken);
                } else {
                    setApiToken(null);
                }

                if (storedRole === "USER" || storedRole === "VET") {
                    setRoleState(storedRole);
                }

                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch { }
                }

                setOnboardingDone(ob === "1");
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, []);

    // ======================
    // 🔁 TOKEN DEĞİŞİNCE ME ÇEK
    // ======================
    useEffect(() => {
        if (token) {
            refreshMe();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // ======================
    // 🔐 LOGIN
    // ======================
    const login = async (newToken: string, newRole: UserRole | null) => {
        console.log("🔐 LOGIN TOKEN SET");

        await AsyncStorage.setItem(TOKEN_KEY, newToken);
        setTokenState(newToken);
        setApiToken(newToken);

        if (newRole) {
            await AsyncStorage.setItem(ROLE_KEY, newRole);
            setRoleState(newRole);
        }

        // ⏳ küçük delay → interceptor otursun
        setTimeout(() => {
            refreshMe();
        }, 100);
    };

    // ======================
    // SET ROLE
    // ======================
    const setRole = async (newRole: UserRole) => {
        await api.post("/api/Auth/set-role", { role: newRole });
        await AsyncStorage.setItem(ROLE_KEY, newRole);
        setRoleState(newRole);
        await refreshMe();
    };

    // ======================
    // ONBOARDING
    // ======================
    const completeOnboarding = async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, "1");
        setOnboardingDone(true);
    };

    const resetOnboarding = async () => {
        await AsyncStorage.removeItem(ONBOARDING_KEY);
        setOnboardingDone(false);
    };

    // ======================
    // LOGOUT
    // ======================
    const logout = async () => {
        console.log("🚪 LOGOUT");

        await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY, USER_KEY]);
        setTokenState(null);
        setRoleState(null);
        setUser(null);
        setApiToken(null);
    };

    const value = useMemo(
        () => ({
            token,
            role,
            user,
            loading,
            onboardingDone,
            completeOnboarding,
            resetOnboarding,
            login,
            setRole,
            logout,
            refreshMe,
        }),
        [token, role, user, loading, onboardingDone]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};



