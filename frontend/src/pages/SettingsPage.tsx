import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useFetchUserData } from "../hooks/useFetchUserData";

import ProfileAvatarForm from "../components/settings/ProfileAvatarForm";
import NameUpdateForm from "../components/settings/NameUpdateForm";
import PasswordChangeForm from "../components/settings/PasswordChangeForm";
import TelegramLinkSection from "../components/settings/TelegramLinkSection";

import "../styles/SettingsPage.css";

export default function SettingsPage() {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useFetchUserData();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      const timeout = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="settings-page">
        <h1>⚙️ Настройки профиля</h1>
        <p>🔄 Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h1>⚙️ Настройки профиля</h1>
      <div className="settings-grid">
        <ProfileAvatarForm />
        <NameUpdateForm />
        <PasswordChangeForm />
        <TelegramLinkSection />
      </div>
    </div>
  );
}
