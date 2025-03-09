import { create } from "zustand";

interface AuthState {
  token: string | null;
  username: string | null;
  telegramId: string | null;
  setToken: (token: string) => void;
  setUsername: (username: string) => void;
  setTelegramId: (telegramId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  telegramId: null,
  setToken: (token) => set({ token }),
  setUsername: (username) => set({ username }),
  setTelegramId: (telegramId) => set({ telegramId }),
  logout: () => set({ token: null, username: null, telegramId: null }),
}));
