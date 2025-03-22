import { useAuthStore } from "../store/auth";
import { API_BOT_USERNAME } from "../config";
import "../styles/TelegramLogin.css";

export default function TelegramLogin() {
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

    const telegramAuthURL = `https://telegram.me/${API_BOT_USERNAME}?start=${encodeURIComponent(username)}`;

    window.open(telegramAuthURL, "_blank", "noopener,noreferrer");
  };

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
