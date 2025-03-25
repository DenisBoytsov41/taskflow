import { useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { refreshAccessToken, restoreSession } from "../api/auth";
import { getProfile } from "../api/auth/userSettings"
import { useNavigate } from "react-router-dom";

export function useFetchUserData(polling = true) {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const username = useAuthStore((s) => s.username);
  const setUsername = useAuthStore((s) => s.setUsername);
  const setTelegramId = useAuthStore((s) => s.setTelegramId);
  const setFullName = useAuthStore((s) => s.setFullName);
  const setAvatar = useAuthStore((s) => s.setAvatar);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const fetchUserData = async () => {
      try {
        let accessToken = token || localStorage.getItem("token");
        const storedUsername = username || localStorage.getItem("username");

        if (!accessToken && storedUsername) {
          accessToken = await restoreSession() || await refreshAccessToken();
          if (accessToken) {
            setToken(accessToken);
            localStorage.setItem("token", accessToken);
          } else {
            throw new Error("Не удалось обновить токен");
          }
        }

        const response = await getProfile();
        const data = response.data;

        if (data?.username) {
          setUsername(data.username);
          localStorage.setItem("username", data.username);
        }

        setTelegramId(data?.telegram_id || null);
        localStorage.setItem("telegramId", data?.telegram_id || "");

        setFullName(data?.full_name || null);
        if (data?.full_name) {
          localStorage.setItem("fullName", data.full_name);
        } else {
          localStorage.removeItem("fullName");
        }

        setAvatar(data?.avatar || null);
        if (data?.avatar) {
          localStorage.setItem("avatar", data.avatar);
        } else {
          localStorage.removeItem("avatar");
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
  }, [
    token,
    username,
    setToken,
    setUsername,
    setTelegramId,
    setFullName,
    setAvatar,
    logout,
    navigate,
    polling
  ]);
}
