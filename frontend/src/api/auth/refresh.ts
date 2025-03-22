import { API_BACKEND_URL } from "../../config";
import { logout } from "./logout";

export const refreshAccessToken = async () => {
  try {
    console.log("Запрос на обновление Access Token...");

    const username = localStorage.getItem("username");
    if (!username) {
      console.warn("Имя пользователя отсутствует, требуется повторный вход.");
      throw new Error("Имя пользователя отсутствует");
    }

    const response = await fetch(`${API_BACKEND_URL}/users/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      console.error("Ошибка при обновлении токена. Код:", response.status);
      if (response.status === 401) {
        console.warn("Refresh Token истек или не найден, выполняем выход.");
        logout();
      }
      throw new Error("Ошибка при обновлении токена");
    }

    const responseData = await response.json();
    const newAccessToken = responseData.data?.access_token;

    if (!newAccessToken) {
      throw new Error("Ответ сервера не содержит Access Token");
    }

    localStorage.setItem("token", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Ошибка обновления токена:", error);
    throw error;
  }
};
