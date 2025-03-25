import { API_BACKEND_URL } from "../../config";
import { encryptPassword } from "../../utils/encryptPassword";

export const updateFullName = async (fullName: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("⛔ Токен не найден");

  const response = await fetch(`${API_BACKEND_URL}/users/update-fullname`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ full_name: fullName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "❌ Ошибка обновления ФИО");
  }

  return await response.json();
};

export const updateAvatar = async (avatarBase64: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен не найден");

  const response = await fetch(`${API_BACKEND_URL}/users/update-avatar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ avatar: avatarBase64 }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Ошибка при обновлении аватара:", data);
    throw new Error(data.message || "Ошибка обновления аватара");
  }

  if (!data?.data?.avatar) {
    throw new Error("Ответ не содержит URL аватара");
  }

  return data;
};

export const changePassword = async (newPassword: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Токен не найден");

    const encryptedPassword = encryptPassword(newPassword);

    const response = await fetch(`${API_BACKEND_URL}/users/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password: encryptedPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || "Ошибка при смене пароля");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Ошибка при смене пароля:", error);
    throw error;
  }
};

export const subscribeTelegram = async (username: string, telegramId: string) => {
  const response = await fetch(`${API_BACKEND_URL}/users/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, telegram_id: telegramId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Ошибка привязки Telegram");
  }

  return data;
};

export const unlinkTelegram = async (username: string) => {
  const response = await fetch(`${API_BACKEND_URL}/users/unlink`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Ошибка отвязки Telegram");
  }

  return data;
};

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен не найден");

  const response = await fetch(`${API_BACKEND_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Ошибка при получении профиля:", data);
    throw new Error(data.message || "Ошибка получения профиля");
  }

  return data;
};
