import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import TelegramLogin from "../components/TelegramLogin"; 

export default function Dashboard() {
  const token = useAuthStore((state) => state.token);
  const telegramId = useAuthStore((state) => state.telegramId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.warn("⚠️ Нет токена, перенаправляем на /login.");
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">📌 Добро пожаловать в Dashboard</h1>
      {telegramId ? (
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
