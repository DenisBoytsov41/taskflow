import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth";
import { linkTelegram, getUserInfo, refreshAccessToken } from "../api/auth";
import { useNavigate } from "react-router-dom";
import "../styles/LinkTelegram.css";

export default function LinkTelegram() {
  const username = useAuthStore((state) => state.username);
  const setTelegramId = useAuthStore((state) => state.setTelegramId);
  const setToken = useAuthStore((state) => state.setToken);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleTelegramLink = async () => {
      if (!username) {
        console.warn("⚠️ Пользователь не авторизован, перенаправляем на /login.");
        navigate("/login");
        return;
      }

      try {
        console.log("🔄 Проверяем актуальность Access Token...");
        let accessToken = token || localStorage.getItem("token");

        if (!accessToken) {
          console.log("🔄 Access Token отсутствует, пробуем обновить...");
          accessToken = await refreshAccessToken();

          if (accessToken) {
            setToken(accessToken);
            localStorage.setItem("token", accessToken);
          } else {
            console.warn("⚠️ Ошибка обновления токена. Перенаправляем на страницу входа.");
            navigate("/login");
            return;
          }
        }

        console.log("✅ Access Token обновлен и используется.");
      } catch (error) {
        console.error("❌ Ошибка обновления токена:", error);
        navigate("/login");
        return;
      }

      try {
        console.log("🔍 Проверяем, привязан ли Telegram...");
        const userData = await getUserInfo();
        if (userData?.data?.telegram_id) {
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

        if (updatedUserData?.data?.telegram_id) {
          console.log("✅ Обновленные данные пользователя:", updatedUserData.data.telegram_id);
          setTelegramId(updatedUserData.data.telegram_id);
          localStorage.setItem("telegramId", updatedUserData.data.telegram_id);
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

    handleTelegramLink();
  }, [username, token, setTelegramId, setToken, navigate]);

  return (
    <div className="link-telegram-container">
      <h2 className="link-telegram-title">🔗 Привязка Telegram</h2>
      {loading ? (
        <p className="loading">🔄 Ожидание подтверждения...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <p className="success">✅ Telegram успешно привязан!</p>
      )}
    </div>
  );
}
