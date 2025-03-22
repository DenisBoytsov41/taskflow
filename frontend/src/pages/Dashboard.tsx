import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserInfo, refreshAccessToken, restoreSession } from "../api/auth";
import TelegramLogin from "../components/TelegramLogin";
import "../styles/Dashboard.css";

export default function Dashboard() {
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
          console.log("Токен отсутствует. Пробуем восстановить сессию...");

          try {
            if (!storedUsername) {
              throw new Error("Имя пользователя отсутствует в localStorage.");
            }

            accessToken = await restoreSession();
            if (accessToken) {
              console.log("Сессия успешно восстановлена!");
            } else {
              console.warn("Не удалось восстановить сессию. Пробуем обновить токен...");
              accessToken = await refreshAccessToken();
            }

            if (accessToken) {
              setToken(accessToken);
              localStorage.setItem("token", accessToken);
            } else {
              throw new Error("Не удалось обновить или восстановить токен");
            }
          } catch (error) {
            console.warn("Ошибка восстановления или обновления токена. Перенаправляем на страницу входа.");
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
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных пользователя:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData(); 

    const interval = setInterval(fetchUserData, 3000);

    return () => clearInterval(interval); 
  }, [token, username, setToken, setUsername, setTelegramId, navigate]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">📌 Добро пожаловать в Dashboard</h1>
        {loading ? (
          <p className="dashboard-loading">🔄 Загрузка...</p>
        ) : (
          <>
            <p className="dashboard-username">👤 Пользователь: {username}</p>
            {telegramId ? (
              <p className="dashboard-telegram">📱 Ваш Telegram ID: {telegramId}</p>
            ) : (
              <>
                <p className="dashboard-error">❌ Telegram не привязан</p>
                <p className="dashboard-hint">Отправьте команду <code>/start</code> боту в Telegram и подождите...</p>
                <TelegramLogin />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
