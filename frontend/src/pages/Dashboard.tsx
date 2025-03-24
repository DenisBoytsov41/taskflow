import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFetchUserData } from "../hooks/useFetchUserData";
import TelegramLogin from "../components/TelegramLogin";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const username = useAuthStore((state) => state.username);
  const telegramId = useAuthStore((state) => state.telegramId);
  const [loading, setLoading] = useState(true);

  useFetchUserData();

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

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
