import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function Navbar() {
  const token = useAuthStore((state) => state.token);
  const telegramId = useAuthStore((state) => state.telegramId);

  return (
    <nav className="p-4 bg-gray-800 text-white flex gap-4">
      <Link to="/">Home</Link>
      {!token ? (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        <>
          {telegramId ? (
            <span>📱 Telegram ID: {telegramId}</span>
          ) : (
            <Link to="/link-telegram">🔗 Привязать Telegram</Link>
          )}
        </>
      )}
    </nav>
  );
}
