import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFetchUserData } from "../hooks/useFetchUserData";
import TelegramLogin from "../components/TelegramLogin";
import { subscribeTelegram } from "../api/auth/userSettings";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const username = useAuthStore((state) => state.username);
  const fullName = useAuthStore((state) => state.fullName);
  const avatar = useAuthStore((state) => state.avatar);
  const telegramId = useAuthStore((state) => state.telegramId);
  const setTelegramId = useAuthStore((state) => state.setTelegramId);

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFetchUserData();

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleTelegramLinkSuccess = async (telegramId: string) => {
    try {
      await subscribeTelegram(username!, telegramId);
      setTelegramId(telegramId);
      setSuccessMessage("✅ Telegram успешно привязан!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error("Ошибка при привязке Telegram:", error);
      setErrorMessage("❌ Не удалось привязать Telegram");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">📌 Добро пожаловать в Dashboard</h1>
        {loading ? (
          <p className="dashboard-loading">🔄 Загрузка...</p>
        ) : (
          <>
            {avatar && (
              <img src={avatar} alt="Аватар" className="dashboard-avatar" />
            )}
            {fullName && (
              <p className="dashboard-name">🧑‍💼 ФИО: {fullName}</p>
            )}
            <p className="dashboard-username">👤 Логин: {username}</p>

            {telegramId ? (
              <p className="dashboard-telegram">📱 Telegram ID: {telegramId}</p>
            ) : (
              <>
                <p className="dashboard-error">❌ Telegram не привязан</p>
                <p className="dashboard-hint">
                  Отправьте команду <code>/start</code> боту в Telegram и подождите...
                </p>
                <TelegramLogin onSuccess={handleTelegramLinkSuccess} />
              </>
            )}

            {successMessage && <p className="dashboard-success">{successMessage}</p>}
            {errorMessage && <p className="dashboard-error">{errorMessage}</p>}
          </>
        )}
      </div>
    </div>
  );
}
