import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFetchUserData } from "../hooks/useFetchUserData";
import TelegramLogin from "../components/TelegramLogin";
import "../styles/LinkTelegram.css";

export default function LinkTelegram() {
  const telegramId = useAuthStore((state) => state.telegramId);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useFetchUserData();

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (telegramId) {
      navigate("/dashboard");
    }
  }, [telegramId, navigate]);

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
          <p className="hint">Отправьте команду <code>/start</code> боту в Telegram и подождите пару секунд...</p>
          <TelegramLogin />
        </>
      )}
    </div>
  );
}
