import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import "../styles/Navbar.css";

export default function Navbar() {
  const token = useAuthStore((state) => state.token);
  const telegramId = useAuthStore((state) => state.telegramId);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-links">
          <Link to="/">🏠 Главная</Link>
          {token ? (
            <>
              <Link to="/dashboard">📊 Панель управления</Link>
              {telegramId ? (
                <span className="telegram-info">📱 Telegram ID: {telegramId}</span>
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
      </div>
    </nav>
  );
}
