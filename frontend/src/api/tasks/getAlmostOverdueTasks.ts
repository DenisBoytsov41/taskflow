import { API_BACKEND_URL } from "../../config";

export const getAlmostOverdueTasks = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("⛔ Токен не найден");

  const response = await fetch(`${API_BACKEND_URL}/tasks/expiring`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "❌ Ошибка получения задач с близким дедлайном");
  return data;
};