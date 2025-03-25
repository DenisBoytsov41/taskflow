import { API_BACKEND_URL } from "../../config";

export const getCompletedTasks = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("⛔ Токен не найден");

  const response = await fetch(`${API_BACKEND_URL}/tasks/completed`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "❌ Ошибка получения завершённых задач");
  return data;
};