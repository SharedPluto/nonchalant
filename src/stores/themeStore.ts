import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '@/types';

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      toggle: () => {
        const newMode = get().mode === 'light' ? 'dark' : 'light';
        set({ mode: newMode });
        document.documentElement.setAttribute('data-theme', newMode);
      },
      setMode: (mode) => {
        set({ mode });
        document.documentElement.setAttribute('data-theme', mode);
      },
    }),
    {
      name: 'nonchalant-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.mode);
        }
      },
    }
  )
);
