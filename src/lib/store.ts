"use client";

import { create } from "zustand";

interface StudioState {
  isPaletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  togglePalette: () => void;
  /** Prompt handed from Prompt Engine to Image Studio. */
  draftPrompt: string;
  setDraftPrompt: (prompt: string) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  isPaletteOpen: false,
  setPaletteOpen: (open) => set({ isPaletteOpen: open }),
  togglePalette: () => set((s) => ({ isPaletteOpen: !s.isPaletteOpen })),
  draftPrompt: "",
  setDraftPrompt: (prompt) => set({ draftPrompt: prompt }),
}));
