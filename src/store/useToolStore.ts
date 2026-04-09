import { create } from 'zustand';

export type ToolType = 'select' | 'point' | 'line' | 'cube' | 'pyramid';

interface ToolState {
    activeTool: ToolType;
    setTool: (tool: ToolType) => void;
    shiftPressed: boolean;
    setShiftPressed: (pressed: boolean) => void;
}

export const useToolStore = create<ToolState>((set) => ({
    activeTool: 'select',
    setTool: (tool) => set({ activeTool: tool }),
    shiftPressed: false,
    setShiftPressed: (pressed) => set({ shiftPressed: pressed }),
}));
