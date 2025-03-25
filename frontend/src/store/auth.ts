import { create } from "zustand";
import { refreshAccessToken, logout } from "../api/auth";

interface AuthState {
  token: string | null;
  username: string | null;
  telegramId: string | null;
  fullName: string | null;
  avatar: string | null;

  setToken: (token: string | null) => void;
  setUsername: (username: string) => void;
  setTelegramId: (telegramId: string | null) => void;
  setFullName: (fullName: string | null) => void;
  setAvatar: (avatar: string | null) => void;

  refreshToken: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  username: localStorage.getItem("username"),
  telegramId: localStorage.getItem("telegramId"),
  fullName: localStorage.getItem("fullName"),
  avatar: localStorage.getItem("avatar"),

  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    set({ token });
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

  setFullName: (fullName) => {
    if (fullName) {
      localStorage.setItem("fullName", fullName);
    } else {
      localStorage.removeItem("fullName");
    }
    set({ fullName });
  },

  setAvatar: (avatar) => {
    if (avatar) {
      localStorage.setItem("avatar", avatar);
    } else {
      localStorage.removeItem("avatar");
    }
    set({ avatar });
  },

  refreshToken: async () => {
    try {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        useAuthStore.getState().setToken(newAccessToken);
      } else {
        console.warn("🔁 Не удалось обновить токен, выполняем выход");
        useAuthStore.getState().logout();
      }
    } catch (error) {
      console.error("❌ Ошибка обновления токена:", error);
      useAuthStore.getState().logout();
    }
  },

  logout: async () => {
    try {
      const username = localStorage.getItem("username");
      if (username) {
        console.log("🚪 Отправляем запрос на выход для:", username);
        await logout(username);
      }

      localStorage.clear();

      set({
        token: null,
        username: null,
        telegramId: null,
        fullName: null,
        avatar: null,
      });

      console.log("✅ Выход выполнен успешно");
    } catch (error) {
      console.error("❌ Ошибка при выходе:", error);
    }
  },
}));
