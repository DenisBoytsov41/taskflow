import { useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { refreshAccessToken } from "../api/auth";
import "../styles/Home.css";

export default function Home() {
  const token = useAuthStore((state) => state.token);
  const telegramId = useAuthStore((state) => state.telegramId);
  const logout = useAuthStore((state) => state.logout);
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  useEffect(() => {
    const handleTokenRefresh = async () => {
      try {
        let accessToken = token || localStorage.getItem("token");

        if (!accessToken) {
          console.log("🔄 Токен отсутствует. Проверяем возможность обновления...");

          try {
            accessToken = await refreshAccessToken();
            if (accessToken) {
              setToken(accessToken);
              localStorage.setItem("token", accessToken);
            } else {
              console.warn("⚠️ Ошибка обновления токена. Требуется повторный вход.");
              handleLogout();
              return;
            }
          } catch (error) {
            console.error("❌ Ошибка обновления токена:", error);
            handleLogout();
            return;
          }
        }
      } catch (error) {
        console.error("❌ Ошибка при обновлении токена:", error);
        handleLogout();
      }
    };

    handleTokenRefresh();
  }, [token, setToken, navigate]);

  const handleLogout = () => {
    console.log("🚪 Выполняем выход...");
    logout();
    localStorage.removeItem("token"); 
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <h1 className="home-title">🏠 Добро пожаловать в Project Manager</h1>

      {token ? (
        <>
          <p className="home-text">✅ Вы вошли в систему.</p>
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
