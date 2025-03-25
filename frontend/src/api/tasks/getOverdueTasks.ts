import { API_BACKEND_URL } from "../../config";

export const getOverdueTasks = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("⛔ Токен не найден");

  const response = await fetch(`${API_BACKEND_URL}/tasks/overdue`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "❌ Ошибка получения просроченных задач");
  return data;
};