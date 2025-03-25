import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth";
import TelegramLogin from "../TelegramLogin";
import { unlinkTelegram, subscribeTelegram } from "../../api/auth/userSettings";

export default function TelegramLinkSection() {
  const telegramId = useAuthStore((state) => state.telegramId);
  const username = useAuthStore((state) => state.username);
  const setTelegramId = useAuthStore((state) => state.setTelegramId);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleUnlink = async () => {
    if (!username) return;

    try {
      setLoading(true);
      await unlinkTelegram(username);
      setTelegramId(null);
      setMessage("✅ Telegram успешно отвязан!");
    } catch (err: any) {
      setMessage(err.message || "❌ Ошибка при отвязке Telegram");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSubscribe = async (telegramId: string) => {
    if (!username) return;

    try {
      await subscribeTelegram(username, telegramId);
      setTelegramId(telegramId);
      setMessage("✅ Telegram успешно привязан!");
    } catch (err: any) {
      setMessage(err.message || "❌ Ошибка при привязке Telegram");
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="settings-section">
      <h2>📎 Telegram</h2>

      {loading ? (
        <p>🔄 Проверка привязки...</p>
      ) : telegramId ? (
        <>
          <p>✅ Telegram привязан (ID: <code>{telegramId}</code>)</p>
          <button onClick={handleUnlink} className="danger-button">🚫 Отвязать Telegram</button>
        </>
      ) : (
        <>
          <p className="error">❌ Telegram не привязан</p>
          <p className="hint">
            Отправьте команду <code>/start</code> боту в Telegram и подождите...
          </p>
          <TelegramLogin onSuccess={handleSubscribe} />
        </>
      )}

      {message && <p className="status-message">{message}</p>}
    </div>
  );
}
