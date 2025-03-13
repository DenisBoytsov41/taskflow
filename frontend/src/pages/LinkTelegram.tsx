import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth";
import { linkTelegram, getUserInfo } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function LinkTelegram() {
  const username = useAuthStore((state) => state.username);
  const setTelegramId = useAuthStore((state) => state.setTelegramId);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      console.warn("⚠️ Пользователь не авторизован, перенаправляем на /login.");
      navigate("/login");
      return;
    }

    const checkExistingTelegram = async () => {
      try {
        console.log("🔄 Проверяем, привязан ли Telegram...");
        const userData = await getUserInfo();

        if (userData && userData.data?.telegram_id) {
          console.log("✅ Telegram уже привязан:", userData.data.telegram_id);
          setTelegramId(userData.data.telegram_id);
          localStorage.setItem("telegramId", userData.data.telegram_id);
          navigate("/dashboard");
          return;
        }
      } catch (error) {
        console.error("❌ Ошибка при проверке Telegram ID:", error);
      }

      const params = new URLSearchParams(window.location.search);
      const telegramId = params.get("id");

      if (!telegramId) {
        console.warn("⚠️ Telegram ID не найден в URL.");
        setError("Telegram ID не найден. Попробуйте ещё раз.");
        setLoading(false);
        return;
      }

      console.log("✅ Полученный Telegram ID из URL:", telegramId);
      setLoading(true);

      try {
        console.log("📡 Отправляем запрос на привязку Telegram...");
        await linkTelegram(username, telegramId);
        console.log("✅ Telegram ID привязан успешно:", telegramId);
        
        setTelegramId(telegramId);
        localStorage.setItem("telegramId", telegramId);
        
        alert("✅ Telegram успешно привязан!");
        
        console.log("🔄 Запрашиваем обновленные данные пользователя...");
        const updatedUserData = await getUserInfo();

        if (updatedUserData && updatedUserData.telegram_id) {
          console.log("✅ Обновленные данные пользователя:", updatedUserData.telegram_id);
          setTelegramId(updatedUserData.telegram_id);
          localStorage.setItem("telegramId", updatedUserData.telegram_id);
        } else {
          console.warn("⚠️ Telegram ID отсутствует после обновления данных.");
        }

        navigate("/dashboard");
      } catch (error) {
        console.error("❌ Ошибка привязки Telegram:", error);
        setError("Ошибка при привязке Telegram. Попробуйте снова.");
      } finally {
        setLoading(false);
      }
    };

    checkExistingTelegram();
  }, [username, setTelegramId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Привязка Telegram</h2>
      {loading ? (
        <p className="text-gray-500 animate-pulse">🔄 Ожидание подтверждения...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p className="text-green-500">✅ Telegram успешно привязан!</p>
      )}
    </div>
  );
}
