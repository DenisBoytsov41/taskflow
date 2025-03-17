import { API_BACKEND_URL } from "../config";
import { useAuthStore } from "../store/auth";

export const login = async (username: string, password: string) => {
  try {
    const response = await fetch(`${API_BACKEND_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Неверные учетные данные");
    }

    const responseData = await response.json();
    const accessToken = responseData.data?.access_token;

    if (!accessToken) {
      throw new Error("Ответ сервера не содержит Access Token");
    }

    localStorage.setItem("token", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Ошибка входа:", error);
    throw error;
  }
};


export const register = async (username: string, password: string) => {
  try {
    const response = await fetch(`${API_BACKEND_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Ошибка регистрации");
    }

    const responseData = await response.json();
    const accessToken = responseData.data?.access_token;

    if (!accessToken) {
      throw new Error("Ответ сервера не содержит Access Token");
    }

    localStorage.setItem("token", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    throw error;
  }
};

export const linkTelegram = async (username: string, telegramId: string) => {
  try {
    const response = await fetch(`${API_BACKEND_URL}/users/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, telegram_id: telegramId }),
    });

    if (!response.ok) {
      throw new Error("Ошибка привязки Telegram");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка привязки Telegram:", error);
    throw error;
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("Refresh Token отсутствует. Требуется повторный вход.");
    }

    const response = await fetch(`${API_BACKEND_URL}/users/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Ошибка при обновлении токена");
    }

    const responseData = await response.json();
    const accessToken = responseData.data?.access_token;

    if (!accessToken) {
      throw new Error("Ответ сервера не содержит Access Token");
    }

    localStorage.setItem("token", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Ошибка обновления токена:", error);
    throw error;
  }
};

export const getUserInfo = async () => {
  let accessToken = localStorage.getItem("token");

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch(`${API_BACKEND_URL}/users/me`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 401) {
        console.warn("⚠️ Access Token истек. Обновляем...");
        accessToken = await refreshAccessToken();
        if (accessToken) {
          return fetchUserInfo(accessToken);
        }
      }

      throw new Error("Не удалось получить информацию о пользователе");
    } catch (error) {
      console.error("Ошибка получения информации о пользователе:", error);
      throw error;
    }
  };

  if (!accessToken) {
    throw new Error("Токен отсутствует");
  }

  return fetchUserInfo(accessToken);
};

export const logout = async (username?: string) => {
  try {
    const user = username || localStorage.getItem("username"); 
    if (!user) {
      throw new Error("Ошибка выхода: Имя пользователя отсутствует");
    }

    await fetch(`${API_BACKEND_URL}/users/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user }),
    });

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("telegramId");

    useAuthStore.getState().logout();
  } catch (error) {
    console.error("Ошибка выхода:", error);
    throw error;
  }
};


