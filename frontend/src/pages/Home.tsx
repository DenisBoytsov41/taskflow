import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useFetchUserData } from "../hooks/useFetchUserData";
import "../styles/Home.css";

export default function Home() {
  const token = useAuthStore((state) => state.token);
  const username = useAuthStore((state) => state.username);
  const fullName = useAuthStore((state) => state.fullName);
  const avatar = useAuthStore((state) => state.avatar);
  const telegramId = useAuthStore((state) => state.telegramId);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useFetchUserData();

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("telegramId");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <h1 className="home-title">🏠 Добро пожаловать в ToDo</h1>

      {loading ? (
        <p className="home-loading">🔄 Загрузка...</p>
      ) : token ? (
        <>
          {avatar && <img src={avatar} alt="Аватар" className="home-avatar" />}
          {fullName && <p className="home-fullname">🧑‍💼 ФИО: {fullName}</p>}
          <p className="home-text">✅ Вы вошли в систему.</p>
          <p className="home-username">👤 Ваш логин: {username}</p>
          {telegramId && <p className="home-telegram">📱 Ваш Telegram ID: {telegramId}</p>}

          <button className="home-button logout" onClick={handleLogout}>
            🚪 Выйти
          </button>
        </>
      ) : (
        <>
          <p className="home-text">🔑 Войдите или зарегистрируйтесь, чтобы продолжить.</p>

          <div className="home-buttons">
            <button className="home-button login" onClick={() => navigate("/login")}>
              🔑 Войти
            </button>
            <button className="home-button register" onClick={() => navigate("/register")}>
              📝 Регистрация
            </button>
          </div>
        </>
      )}
    </div>
  );
}
