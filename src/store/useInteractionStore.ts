import { create } from 'zustand';

interface IVector3 {
    x: number;
    y: number;
    z: number;
}

interface InteractionState {
    draftLineStartId: string | null;
    draftLineCurrentPos: IVector3 | null;
    setDraftLineStartId: (id: string | null) => void;
    setDraftLineCurrentPos: (pos: IVector3 | null) => void;

    // Solid building states
    solidBuildStep: number;
    solidPointsId: string[];
    setSolidBuildStep: (step: number) => void;
    addSolidPoint: (id: string) => void;
    resetSolidBuild: () => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
    draftLineStartId: null,
    draftLineCurrentPos: null,
    setDraftLineStartId: (id) => set({ draftLineStartId: id }),
    setDraftLineCurrentPos: (pos) => set({ draftLineCurrentPos: pos }),

    solidBuildStep: 0,
    solidPointsId: [],
    setSolidBuildStep: (step) => set({ solidBuildStep: step }),
    addSolidPoint: (id) => set((state) => ({ solidPointsId: [...state.solidPointsId, id] })),
    resetSolidBuild: () => set({ solidBuildStep: 0, solidPointsId: [] }),
}));
