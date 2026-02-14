import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { Pet } from "../types/Pet";

export type AIResult = {
    score?: number;
    warning?: string;
    notes?: string;
};

type PetContextValue = {
    pets: Pet[];
    loading: boolean;

    loadPets: () => Promise<void>;
    refreshPets: () => Promise<void>;

    addPet: (pet: Partial<Pet>) => Promise<void>;
    deletePet: (id: number) => Promise<void>;
    updatePet: (id: number, patch: Partial<Pet>) => Promise<void>;

    getPetById: (id: number) => Pet | undefined;
    saveAIResultToPet: (petId: number, result: AIResult) => void;
};

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: React.ReactNode }) {
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(false);

    // =============================
    // 🔥 LOAD PETS
    // =============================
    const loadPets = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/Pets");
            console.log("🐾 PETS FROM API:", res.data);
            setPets(res.data || []);
        } catch (err: any) {
            console.log("❌ LOAD PETS ERROR:", err?.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshPets = loadPets;

    // =============================
    // ✅ UYGULAMA AÇILINCA OTOMATİK PETLERİ ÇEK
    // =============================
    useEffect(() => {
        loadPets();
    }, []);

    // =============================
    // CRUD
    // =============================
    const addPet = async (pet: Partial<Pet>) => {
        await api.post("/api/Pets", pet);
        await loadPets();
    };

    const deletePet = async (id: number) => {
        await api.delete(`/api/Pets/${id}`);
        await loadPets();
    };

    const updatePet = async (id: number, patch: Partial<Pet>) => {
        await api.put(`/api/Pets/${id}`, patch);
        await loadPets();
    };

    const getPetById = (id: number) => pets.find((p) => p.id === id);

    const saveAIResultToPet = (petId: number, result: AIResult) => {
        setPets((prev) =>
            prev.map((p) =>
                p.id === petId
                    ? { ...p, aiNotes: result.notes, aiScore: result.score }
                    : p
            )
        );
    };

    const value = useMemo(
        () => ({
            pets,
            loading,
            loadPets,
            refreshPets,
            addPet,
            deletePet,
            updatePet,
            getPetById,
            saveAIResultToPet,
        }),
        [pets, loading]
    );

    return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePets() {
    const ctx = useContext(PetContext);
    if (!ctx) throw new Error("usePets must be used within PetProvider");
    return ctx;
}
