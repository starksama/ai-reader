import { create } from 'zustand';

export interface Layer {
  id: string;
  type: 'main' | 'paragraph' | 'reply';
  paragraphIndex?: number;
  content?: string;
}

interface LayerState {
  layers: Layer[];
  currentIndex: number;
  push: (layer: Omit<Layer, 'id'>) => void;
  pop: () => void;
  goTo: (index: number) => void;
  reset: () => void;
}

export const useLayerStore = create<LayerState>((set, get) => ({
  layers: [{ id: 'main', type: 'main' }],
  currentIndex: 0,

  push: (layer) => {
    const id = `layer-${Date.now()}`;
    set((state) => ({
      layers: [...state.layers.slice(0, state.currentIndex + 1), { ...layer, id }],
      currentIndex: state.currentIndex + 1,
    }));
  },

  pop: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  goTo: (index) => {
    const { layers } = get();
    if (index >= 0 && index < layers.length) {
      set({ currentIndex: index });
    }
  },

  reset: () => {
    set({
      layers: [{ id: 'main', type: 'main' }],
      currentIndex: 0,
    });
  },
}));
