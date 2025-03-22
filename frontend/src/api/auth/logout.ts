import { API_BACKEND_URL } from "../../config";
import { useAuthStore } from "../../store/auth";

export const logout = async (username?: string) => {
    try {
      const user = username || localStorage.getItem("username");
      if (!user) {
        console.warn("Имя пользователя отсутствует, выполняем локальный выход.");
      } else {
        console.log("Отправляем запрос на выход для пользователя:", user);
        await fetch(`${API_BACKEND_URL}/users/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user }),
        });
      }
  
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("telegramId");
  
      useAuthStore.getState().logout();
      console.log("Выход выполнен успешно");
    } catch (error) {
      console.error("Ошибка выхода:", error);
      throw error;
    }
  };
