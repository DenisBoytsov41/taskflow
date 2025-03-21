import { create } from "zustand";
import { refreshAccessToken, logout } from "../api/auth";

interface AuthState {
  token: string | null;
  username: string | null;
  telegramId: string | null;
  setToken: (token: string | null) => void;
  setUsername: (username: string) => void;
  setTelegramId: (telegramId: string | null) => void;
  refreshToken: () => Promise<void>;
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

  refreshToken: async () => {
    try {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        useAuthStore.getState().setToken(newAccessToken);
      } else {
        useAuthStore.getState().logout();
      }
    } catch (error) {
      useAuthStore.getState().logout();
    }
  },

  logout: async () => {
    try {
      const username = localStorage.getItem("username");

      if (username) {
        console.log("🚪 Отправляем запрос на выход для пользователя:", username);
        await logout(username);
      } else {
        console.warn("⚠️ Имя пользователя отсутствует, выполняем локальный выход.");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("telegramId");

      set({ token: null, username: null, telegramId: null });

      console.log("✅ Выход выполнен успешно");
    } catch (error) {
      console.error("❌ Ошибка выхода:", error);
    }
  },
}));
