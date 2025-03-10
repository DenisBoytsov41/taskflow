import { create } from "zustand";

interface AuthState {
  token: string | null;
  username: string | null;
  telegramId: string | null;
  setToken: (token: string | null) => void;
  setUsername: (username: string) => void;
  setTelegramId: (telegramId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token") || null,
  username: localStorage.getItem("username") || null,
  telegramId: null,

  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
      set({ token });
    } else {
      localStorage.removeItem("token");
      set({ token: null });
    }
  },

  setUsername: (username) => {
    localStorage.setItem("username", username);
    set({ username });
  },

  setTelegramId: (telegramId) => set({ telegramId }),

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    set({ token: null, username: null, telegramId: null });
  },
}));
