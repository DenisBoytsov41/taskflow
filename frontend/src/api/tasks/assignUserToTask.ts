import { API_BACKEND_URL } from "../../config";

export const assignUserToTask = async (taskId: number, userId: number) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("⛔ Токен не найден");

  const response = await fetch(`${API_BACKEND_URL}/tasks/${taskId}/assign/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "❌ Ошибка назначения пользователя");
  return data;
};