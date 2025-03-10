import { API_BACKEND_URL } from "../config";

export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_BACKEND_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  return await response.json();
};

export const register = async (username: string, password: string) => {
  const response = await fetch(`${API_BACKEND_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return await response.json();
};

export const linkTelegram = async (username: string, telegramId: string) => {
  const response = await fetch(`${API_BACKEND_URL}/users/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, telegram_id: telegramId }),
  });

  if (!response.ok) {
    throw new Error("Failed to link Telegram");
  }

  return await response.json();
};
