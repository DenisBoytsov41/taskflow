import { API_BACKEND_URL } from "../../config";
import { refreshAccessToken } from "./refresh";

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
          console.warn("Access Token истек. Пробуем обновить...");
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
