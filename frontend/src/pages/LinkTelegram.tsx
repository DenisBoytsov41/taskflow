import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth";
import { linkTelegram } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function LinkTelegram() {
  const username = useAuthStore((state) => state.username);
  const setTelegramId = useAuthStore((state) => state.setTelegramId);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      console.warn("⚠️ Пользователь не авторизован, перенаправляем на /login.");
      navigate("/login");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const telegramId = params.get("id");

    if (telegramId) {
      console.log("✅ Полученный Telegram ID:", telegramId);
      setLoading(true);

      linkTelegram(username, telegramId)
        .then(() => {
          setTelegramId(telegramId);
          alert("✅ Telegram успешно привязан!");
          navigate("/dashboard");
        })
        .catch((error) => {
          console.error("❌ Ошибка привязки Telegram:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.warn("⚠️ Telegram ID не найден в URL.");
      setLoading(false);
    }
  }, [username, setTelegramId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Привязка Telegram</h2>
      {loading ? (
        <p className="text-gray-500 animate-pulse">🔄 Ожидание подтверждения...</p>
      ) : (
        <p className="text-red-500">⚠️ Telegram ID не найден. Попробуйте ещё раз.</p>
      )}
    </div>
  );
}
