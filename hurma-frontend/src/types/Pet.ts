export type Pet = {
    id: number;
    userId: number;

    name: string;
    type: string;
    breed?: string;
    age?: string;
    weight?: string;
    height?: string;

    // 📸 FOTO
    photo?: string;

    // 💉 AŞILAR
    rabiesVaccineDate?: string;
    internalParasiteDate?: string;
    externalParasiteDate?: string;

    // 🧠 AI
    aiNotes?: string;
    aiScore?: number;

    createdAt: string;
};
