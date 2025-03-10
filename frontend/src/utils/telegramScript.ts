import { API_BOT_USERNAME } from "../config";

declare global {
  interface Window {
    Telegram: {
      Login?: {
        authRequest: (callback: (user: { id: number }) => void) => void;
      };
    };
  }
}

export const loadTelegramScript = (callback: (telegramId: string) => void) => {
  if (!API_BOT_USERNAME) {
    console.error("Ошибка: TELEGRAM_BOT_USERNAME не установлен.");
    return;
  }

  if (document.getElementById("telegram-widget")) {
    console.warn("Telegram script уже загружен.");
    return;
  }

  const script = document.createElement("script");
  script.id = "telegram-widget";
  script.src = "https://telegram.org/js/telegram-widget.js?19";
  script.async = true;

  script.onload = () => {
    console.log("Telegram script загружен.");
    if (window.Telegram?.Login?.authRequest) {
      window.Telegram.Login.authRequest((user: { id: number }) => {
        callback(user.id.toString());
      });
    } else {
      console.error("Telegram API не доступен.");
    }
  };

  script.onerror = () => {
    console.error("Ошибка загрузки Telegram script.");
  };

  document.head.appendChild(script);
};
