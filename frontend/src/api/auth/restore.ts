import { API_BACKEND_URL } from "../../config";

export const restoreSession = async () => {
    try {
      console.log("Попытка восстановления сессии...");
  
      const username = localStorage.getItem("username");
      if (!username) {
        console.warn("Имя пользователя отсутствует, требуется повторный вход.");
        throw new Error("Имя пользователя отсутствует");
      }
  
      const response = await fetch(`${API_BACKEND_URL}/users/restore-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
  
      if (!response.ok) {
        console.error("Ошибка при восстановлении сессии. Код:", response.status);
        if (response.status === 403) {
          console.warn("Вход с нового IP-адреса. Требуется повторный вход.");
        }
        throw new Error("Ошибка восстановления сессии");
      }
  
      const responseData = await response.json();
      const newAccessToken = responseData.data?.access_token;
  
      if (!newAccessToken) {
        throw new Error("Ответ сервера не содержит Access Token");
      }
  
      localStorage.setItem("token", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Ошибка восстановления сессии:", error);
      throw error;
    }
  };
