import { create } from "zustand";

interface AuthState {
  token: string | null;
  username: string | null;
  telegramId: string | null;
  setToken: (token: string | null) => void;
  setUsername: (username: string) => void;
  setTelegramId: (telegramId: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token") || null,
  username: localStorage.getItem("username") || null,
  telegramId: localStorage.getItem("telegramId") || null,

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

  setTelegramId: (telegramId) => {
    if (telegramId) {
      localStorage.setItem("telegramId", telegramId);
    } else {
      localStorage.removeItem("telegramId");
    }
    set({ telegramId });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("telegramId");
    set({ token: null, username: null, telegramId: null });
  },
}));
