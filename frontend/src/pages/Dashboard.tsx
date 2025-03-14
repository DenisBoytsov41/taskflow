import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserInfo } from "../api/auth";
import TelegramLogin from "../components/TelegramLogin";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const token = useAuthStore((state) => state.token);
  const telegramId = useAuthStore((state) => state.telegramId);
  const setTelegramId = useAuthStore((state) => state.setTelegramId);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const storedTelegramId = localStorage.getItem("telegramId");

    if (telegramId) {
      setLoading(false);
      return;
    }

    if (storedTelegramId) {
      setTelegramId(storedTelegramId);
      setLoading(false);
      return;
    }

    getUserInfo()
      .then((userData) => {
        if (userData.data?.telegram_id) {
          setTelegramId(userData.data.telegram_id);
          localStorage.setItem("telegramId", userData.data.telegram_id);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [token, telegramId, setTelegramId, navigate]);

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
