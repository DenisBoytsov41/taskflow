import { useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { API_BOT_USERNAME } from "../config";
import "../styles/TelegramLogin.css";

interface TelegramLoginProps {
  onSuccess?: (telegramId: string) => void;
}

export default function TelegramLogin({ onSuccess }: TelegramLoginProps) {
  const username = useAuthStore((state) => state.username);

  const handleTelegramAuth = () => {
    if (!username) {
      console.error("Ошибка: username отсутствует");
      return;
    }

    if (!API_BOT_USERNAME) {
      console.error("Ошибка: API_BOT_USERNAME не установлен в config.ts.");
      return;
    }

    const telegramAuthURL = `https://t.me/${API_BOT_USERNAME}?start=${encodeURIComponent(username)}`;
    window.open(telegramAuthURL, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const checkTelegramId = setInterval(() => {
      const storedTelegramId = localStorage.getItem("telegram_id");

      if (storedTelegramId) {
        if (onSuccess) {
          onSuccess(storedTelegramId);
        }
        clearInterval(checkTelegramId);
        localStorage.removeItem("telegram_id");
      }
    }, 1500);

    return () => clearInterval(checkTelegramId);
  }, [onSuccess]);

  return (
    <div className="telegram-login-container">
      {username ? (
        <button onClick={handleTelegramAuth} className="telegram-button">
          🔗 Привязать Telegram
        </button>
      ) : (
        <p className="telegram-warning">⚠️ Войдите, чтобы привязать Telegram.</p>
      )}
    </div>
  );
}
