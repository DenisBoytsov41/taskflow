import { API_BACKEND_URL } from "../../config";

export const linkTelegram = async (username: string, telegramId: string) => {
  try {
    const response = await fetch(`${API_BACKEND_URL}/users/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, telegram_id: telegramId }),
    });

    if (!response.ok) {
      throw new Error("Ошибка привязки Telegram");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка привязки Telegram:", error);
    throw error;
  }
};
