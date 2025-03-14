import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  const token = useAuthStore((state) => state.token);
  const telegramId = useAuthStore((state) => state.telegramId);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">🏠 Добро пожаловать в Project Manager</h1>

      {token ? (
        <>
          <p className="home-text">✅ Вы вошли в систему.</p>
          {telegramId && <p className="home-telegram">📱 Ваш Telegram ID: {telegramId}</p>}

          <button 
            className="home-button logout" 
            onClick={() => { logout(); navigate("/login"); }}
          >
            🚪 Выйти
          </button>
        </>
      ) : (
        <>
          <p className="home-text">🔑 Войдите или зарегистрируйтесь, чтобы продолжить.</p>
          
          <div className="home-buttons">
            <button 
              className="home-button login" 
              onClick={() => navigate("/login")}
            >
              🔑 Войти
            </button>
            <button 
              className="home-button register" 
              onClick={() => navigate("/register")}
            >
              📝 Регистрация
            </button>
          </div>
        </>
      )}
    </div>
  );
}
