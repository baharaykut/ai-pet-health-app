import React, { createContext, useContext, useState } from "react";

export type StoryItem = {
    id: number;
    uri: string;
    caption?: string;
    isVideo?: boolean;
};

type StoryContextType = {
    stories: StoryItem[];
    addStory: (story: StoryItem) => void;
};

const StoryContext = createContext<StoryContextType | null>(null);

export const StoryProvider = ({ children }: any) => {
    const [stories, setStories] = useState<StoryItem[]>([]);

    const addStory = (story: StoryItem) => {
        setStories((prev) => [story, ...prev]); // en üste ekle
    };

    return (
        <StoryContext.Provider value={{ stories, addStory }}>
            {children}
        </StoryContext.Provider>
    );
};

export const useStories = () => useContext(StoryContext)!;
