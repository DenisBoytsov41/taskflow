import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuthStore } from "../store/auth";
import ProfileMenu from "./ProfileMenu";
import "../styles/Navbar.css";

export default function Navbar() {
  const token = useAuthStore((state) => state.token);
  const telegramId = useAuthStore((state) => state.telegramId);

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-links">
          <Link to="/">🏠 Главная</Link>
          {token && <Link to="/dashboard">📊 Панель</Link>}
          {token && telegramId === null && <Link to="/link-telegram">🔗 Привязать Telegram</Link>}
        </div>

        {!token ? (
          <div className="navbar-links">
            <Link to="/login">🔑 Войти</Link>
            <Link to="/register">📝 Регистрация</Link>
          </div>
        ) : (
          <ProfileMenu
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            dropdownRef={dropdownRef}
          />
        )}
      </div>
    </nav>
  );
}
