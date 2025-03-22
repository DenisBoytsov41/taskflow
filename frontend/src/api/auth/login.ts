import { API_BACKEND_URL } from "../../config";
import { encryptPassword } from "../../utils/encryptPassword";

export const login = async (username: string, password: string) => {
  try {
    const encryptedPassword = encryptPassword(password);
    const response = await fetch(`${API_BACKEND_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: encryptedPassword }),
    });

    if (!response.ok) {
      throw new Error("Неверные учетные данные");
    }

    const responseData = await response.json();
    const accessToken = responseData.data?.access_token;

    if (!accessToken) {
      throw new Error("Ответ сервера не содержит Access Token");
    }

    localStorage.setItem("token", accessToken);
    localStorage.setItem("username", username);
    return accessToken;
  } catch (error) {
    console.error("Ошибка входа:", error);
    throw error;
  }
};