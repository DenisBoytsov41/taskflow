import { useAuthStore } from "../store/auth"

interface Props {
  onLogout: () => void;
}

export default function DashboardHeader({ onLogout }: Props) {
  const { avatar, fullName, username, telegramId } = useAuthStore();

  return (
    <>
      <h1 className="dashboard-title">📋 Мои задачи</h1>
      {avatar && <img src={avatar} alt="Аватар" className="dashboard-avatar" />}
      {fullName && <p className="dashboard-name">🧑 ФИО: {fullName}</p>}
      <p className="dashboard-username">👤 Логин: {username}</p>
      {telegramId && (
        <p className="dashboard-telegram">📱 Telegram ID: {telegramId}</p>
      )}
    </>
  );
}
