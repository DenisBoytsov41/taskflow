import { create } from "zustand";

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
  login: async (username, password) => {
    const response = await fetch("http://localhost:8000/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      set({ token: data.access_token });
    }
  },
  logout: () => set({ token: null }),
}));
