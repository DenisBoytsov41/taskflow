import { useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { linkTelegram } from "../api/auth";

const TELEGRAM_BOT_USERNAME = "goodpromisedbot";

export default function TelegramLogin() {
  const username = useAuthStore((state) => state.username);
  const setTelegramId = useAuthStore((state) => state.setTelegramId);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?19";
    script.setAttribute("data-telegram-login", TELEGRAM_BOT_USERNAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-auth-url", "http://localhost:8000/users/telegram-auth");
    script.setAttribute("data-request-access", "write");
    script.async = true;
    document.getElementById("telegram-login")?.appendChild(script);
  }, []);

  const handleTelegramAuth = async (telegramId: string) => {
    if (!username) {
      console.error("Ошибка: username отсутствует");
      return;
    }
  
    try {
      await linkTelegram(username, telegramId);
      setTelegramId(telegramId);
      alert("Telegram успешно привязан!");
    } catch (error) {
      console.error("Ошибка привязки Telegram", error);
    }
  };
  

  return <div id="telegram-login"></div>;
}
