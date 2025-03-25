import { API_BACKEND_URL } from "../../config";

export const createTask = async (taskData: any) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("⛔ Токен не найден");

  const response = await fetch(`${API_BACKEND_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "❌ Ошибка создания задачи");
  return data;
};