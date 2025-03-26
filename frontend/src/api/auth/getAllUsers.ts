import { API_BACKEND_URL } from "../../config";
import { refreshAccessToken } from "./refresh";

export const getAllUsers = async () => {
  let token = localStorage.getItem("token");

  const fetchUsers = async (accessToken: string) => {
    const response = await fetch(`${API_BACKEND_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.data; 
    }

    if (response.status === 401) {
      console.warn("Токен истек. Пробуем обновить...");
      token = await refreshAccessToken();
      if (token) {
        return fetchUsers(token);
      }
    }

    throw new Error("❌ Не удалось получить список пользователей");
  };

  if (!token) throw new Error("⛔ Токен отсутствует");

  return fetchUsers(token);
};
