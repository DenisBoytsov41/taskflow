import { useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { getUserInfo, refreshAccessToken, restoreSession } from "../api/auth";
import { useNavigate } from "react-router-dom";

export function useFetchUserData(polling = true) {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const username = useAuthStore((state) => state.username);
  const setUsername = useAuthStore((state) => state.setUsername);
  const setTelegramId = useAuthStore((state) => state.setTelegramId);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const fetchUserData = async () => {
      try {
        let accessToken = token || localStorage.getItem("token");
        let storedUsername = username || localStorage.getItem("username");

        if (!accessToken && storedUsername) {
          accessToken = await restoreSession() || await refreshAccessToken();
          if (accessToken) {
            setToken(accessToken);
            localStorage.setItem("token", accessToken);
          } else {
            throw new Error("Не удалось обновить токен");
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
        console.warn("❌ Ошибка загрузки данных, выполняем logout:", error);
        logout();
        localStorage.clear();
        navigate("/login");
      }
    };

    fetchUserData();

    if (polling) {
      interval = setInterval(fetchUserData, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [token, username, setToken, setUsername, setTelegramId, logout, navigate, polling]);
}
