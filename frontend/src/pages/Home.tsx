import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { getUserInfo, refreshAccessToken, restoreSession } from "../api/auth";
import "../styles/Home.css";

export default function Home() {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const username = useAuthStore((state) => state.username);
  const setUsername = useAuthStore((state) => state.setUsername);
  const telegramId = useAuthStore((state) => state.telegramId);
  const setTelegramId = useAuthStore((state) => state.setTelegramId);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let accessToken = token || localStorage.getItem("token");
        let storedUsername = username || localStorage.getItem("username");

        if (!accessToken) {
          console.log("Токен отсутствует. Пробуем восстановить сессию...");

          try {
            if (!storedUsername) {
              throw new Error("Имя пользователя отсутствует в localStorage.");
            }

            accessToken = await restoreSession();
            if (accessToken) {
              console.log("Сессия успешно восстановлена!");
            } else {
              console.warn("Не удалось восстановить сессию. Пробуем обновить токен...");
              accessToken = await refreshAccessToken();
            }

            if (accessToken) {
              setToken(accessToken);
              localStorage.setItem("token", accessToken);
            } else {
              throw new Error("Не удалось обновить или восстановить токен");
            }
          } catch (error) {
            console.warn("Ошибка восстановления или обновления токена. Выполняем выход.");
            handleLogout();
            return;
          }
        }

        const userData = await getUserInfo();

        if (userData?.data?.username) {
          setUsername(userData.data.username);
          localStorage.setItem("username", userData.data.username);
        }

        if (userData?.data?.telegram_id) {
          setTelegramId(userData.data.telegram_id);
          localStorage.setItem("telegramId", userData.data.telegram_id);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных пользователя:", error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, username, setToken, setUsername, setTelegramId, navigate]);

  const handleLogout = () => {
    console.log("Выполняем выход...");
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("telegramId");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <h1 className="home-title">🏠 Добро пожаловать в Project Manager</h1>

      {loading ? (
        <p className="home-loading">🔄 Загрузка...</p>
      ) : token ? (
        <>
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
