import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserInfo, refreshAccessToken } from "../api/auth";
import TelegramLogin from "../components/TelegramLogin";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const telegramId = useAuthStore((state) => state.telegramId);
  const setTelegramId = useAuthStore((state) => state.setTelegramId);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let accessToken = token || localStorage.getItem("token");

        if (!accessToken) {
          console.log("🔄 Токен отсутствует. Обновляем через refresh_token...");
          accessToken = await refreshAccessToken();

          if (accessToken) {
            setToken(accessToken);
            localStorage.setItem("token", accessToken);
          } else {
            console.warn("⚠️ Ошибка обновления токена. Перенаправляем на страницу входа.");
            navigate("/login");
            return;
          }
        }

        console.log("✅ Используем токен для запроса данных пользователя.");
        const userData = await getUserInfo();
        if (userData?.data?.telegram_id) {
          setTelegramId(userData.data.telegram_id);
          localStorage.setItem("telegramId", userData.data.telegram_id);
        }
      } catch (error) {
        console.error("❌ Ошибка при загрузке данных пользователя:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, setToken, setTelegramId, navigate]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">📌 Добро пожаловать в Dashboard</h1>
        {loading ? (
          <p className="dashboard-loading">🔄 Загрузка...</p>
        ) : telegramId ? (
          <p className="dashboard-telegram">📱 Ваш Telegram ID: {telegramId}</p>
        ) : (
          <>
            <p className="dashboard-error">❌ Telegram не привязан</p>
            <TelegramLogin />
          </>
        )}
      </div>
    </div>
  );
}
