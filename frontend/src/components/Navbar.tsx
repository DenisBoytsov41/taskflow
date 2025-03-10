import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function Navbar() {
  const token = useAuthStore((state) => state.token);
  const telegramId = useAuthStore((state) => state.telegramId);

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <div className="flex gap-4">
        <Link to="/">🏠 Home</Link>
        {token ? (
          <>
            {telegramId ? (
              <span>📱 Telegram ID: {telegramId}</span>
            ) : (
              <Link to="/link-telegram">🔗 Привязать Telegram</Link>
            )}
          </>
        ) : (
          <>
            <Link to="/login">🔑 Вход</Link>
            <Link to="/register">📝 Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
}
