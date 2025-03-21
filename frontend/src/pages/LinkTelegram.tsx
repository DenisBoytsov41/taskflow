import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserInfo, refreshAccessToken, restoreSession } from "../api/auth";
import TelegramLogin from "../components/TelegramLogin";
import "../styles/LinkTelegram.css";

export default function LinkTelegram() {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const username = useAuthStore((state) => state.username);
  const setUsername = useAuthStore((state) => state.setUsername);
  const telegramId = useAuthStore((state) => state.telegramId);
  const setTelegramId = useAuthStore((state) => state.setTelegramId);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let accessToken = token || localStorage.getItem("token");
        let storedUsername = username || localStorage.getItem("username");

        if (!accessToken) {
          console.log("🔄 Токен отсутствует. Пробуем восстановить сессию...");

          try {
            if (!storedUsername) {
              throw new Error("Имя пользователя отсутствует в localStorage.");
            }

            accessToken = await restoreSession();
            if (accessToken) {
              console.log("✅ Сессия успешно восстановлена!");
            } else {
              console.warn("⚠️ Не удалось восстановить сессию. Пробуем обновить токен...");
              accessToken = await refreshAccessToken();
            }

            if (accessToken) {
              setToken(accessToken);
              localStorage.setItem("token", accessToken);
            } else {
              throw new Error("Не удалось обновить или восстановить токен");
            }
          } catch (error) {
            console.warn("⚠️ Ошибка восстановления или обновления токена. Перенаправляем на страницу входа.");
            navigate("/login");
            return;
          }
        }

        const userData = await getUserInfo();

        if (userData?.data?.username) {
          setUsername(userData.data.username);
          localStorage.setItem("username", userData.data.username);
        }

        if (userData?.data?.telegram_id) {
          setTelegramId(userData.data.telegram_id);
          localStorage.setItem("telegramId", userData.data.telegram_id);
          navigate("/dashboard");
          return;
        }
      } catch (error) {
        console.error("❌ Ошибка при загрузке данных пользователя:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, username, setToken, setUsername, setTelegramId, navigate]);

  return (
    <div className="link-telegram-container">
      <h2 className="link-telegram-title">🔗 Привязка Telegram</h2>
      {loading ? (
        <p className="loading">🔄 Загрузка...</p>
      ) : telegramId ? (
        <p className="success">✅ Telegram успешно привязан!</p>
      ) : (
        <>
          <p className="error">❌ Telegram не привязан</p>
          <TelegramLogin />
        </>
      )}
    </div>
  );
}
