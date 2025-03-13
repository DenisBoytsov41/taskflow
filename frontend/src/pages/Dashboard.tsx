import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserInfo } from "../api/auth";
import TelegramLogin from "../components/TelegramLogin";

export default function Dashboard() {
  const token = useAuthStore((state) => state.token);
  const telegramId = useAuthStore((state) => state.telegramId);
  const setTelegramId = useAuthStore((state) => state.setTelegramId);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    if (!token) {
      console.warn("⚠️ Нет токена, перенаправляем на /login.");
      navigate("/login");
      return;
    }

    const storedTelegramId = localStorage.getItem("telegramId");

    if (telegramId) {
      console.log("✅ Telegram ID найден в Zustand:", telegramId);
      setLoading(false);
      return;
    }

    if (storedTelegramId) {
      console.log("✅ Telegram ID найден в localStorage:", storedTelegramId);
      setTelegramId(storedTelegramId);
      setLoading(false);
      return;
    }

    if (!isFetched) {
      console.log("🔍 Telegram ID не найден, запрашиваем с сервера...");
      setIsFetched(true);

      getUserInfo()
        .then((userData) => {
          if (userData.data?.telegram_id) {
            console.log("✅ Получен Telegram ID с сервера:", userData.data.telegram_id);
            setTelegramId(userData.data.telegram_id);
            localStorage.setItem("telegramId", userData.data.telegram_id);
          } else {
            console.warn("⚠️ Telegram ID отсутствует в данных сервера.");
          }
        })
        .catch((error) => {
          console.error("❌ Ошибка загрузки данных пользователя:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token, telegramId, setTelegramId, navigate, isFetched]);

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedTelegramId = localStorage.getItem("telegramId");
      if (updatedTelegramId) {
        console.log("🔄 Telegram ID изменился в localStorage:", updatedTelegramId);
        setTelegramId(updatedTelegramId);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setTelegramId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">📌 Добро пожаловать в Dashboard</h1>
      {loading ? (
        <p className="mt-4 text-gray-500 animate-pulse">🔄 Загрузка...</p>
      ) : telegramId ? (
        <p className="mt-4">📱 Ваш Telegram ID: {telegramId}</p>
      ) : (
        <>
          <p className="mt-4 text-red-500">❌ Telegram не привязан</p>
          <TelegramLogin />
        </>
      )}
    </div>
  );
}
