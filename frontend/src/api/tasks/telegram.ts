import { API_BACKEND_URL } from "../../config";

export const sendTelegramMessage = async (username: string, message: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("⛔ Токен не найден");

  const response = await fetch(`${API_BACKEND_URL}/telegram/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username, message }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "❌ Ошибка отправки в Telegram");

  return data;
};
