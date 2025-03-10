import { useAuthStore } from "../store/auth";
import { API_BOT_USERNAME, API_BASE_URL } from "../config";

export default function TelegramLogin() {
  const username = useAuthStore((state) => state.username);

  const handleTelegramAuth = () => {
    if (!username) {
      console.error("❌ Ошибка: username отсутствует");
      return;
    }

    if (!API_BOT_USERNAME) {
      console.error("❌ Ошибка: API_BOT_USERNAME не установлен в config.ts.");
      return;
    }

    const telegramAuthURL = `https://telegram.me/${API_BOT_USERNAME}?start=auth`;

    window.location.href = telegramAuthURL;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Привязка Telegram</h2>
      {username ? (
        <button
          onClick={handleTelegramAuth}
          className="bg-blue-500 text-white p-3 rounded-lg text-lg shadow-lg hover:bg-blue-600 transition"
        >
          🔗 Привязать Telegram
        </button>
      ) : (
        <p className="text-red-500">⚠️ Войдите, чтобы привязать Telegram.</p>
      )}
    </div>
  );
}
