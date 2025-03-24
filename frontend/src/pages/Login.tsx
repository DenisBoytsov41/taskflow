import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setToken = useAuthStore((state) => state.setToken);
  const setUsernameStore = useAuthStore((state) => state.setUsername);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (useAuthStore.getState().token) {
      navigate("/", { replace: true }); 
    }
  }, []);
  

  const validateInput = () => {
    if (username.length < 4) {
      setError("⚠️ Имя пользователя должно содержать минимум 4 символа.");
      return false;
    }
    if (password.length < 6) {
      setError("⚠️ Пароль должен содержать минимум 6 символов.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateInput()) return;

    setLoading(true);
    try {
      console.log("📨 Отправка запроса на вход...");
      const accessToken = await login(username, password);

      if (!accessToken) {
        throw new Error("Ошибка: Не получен Access Token.");
      }

      console.log("Вход выполнен успешно.");

      setToken(accessToken);
      setUsernameStore(username);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("username", username);

      navigate("/dashboard");
    } catch (error) {
      console.error("Ошибка входа:", error);
      setError("❌ Неверное имя пользователя или пароль.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">🔑 Вход</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="login-form">
        <input 
          type="text" 
          placeholder="Имя пользователя" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
          autoComplete="username"
        />

        <div className="password-container">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Пароль" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="input-field password-input"
            autoComplete="current-password"
          />
          <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button 
          type="submit" 
          className="login-button"
          disabled={loading}
        >
          {loading ? "⏳ Вход..." : "Войти"}
        </button>

        <p className="register-text">
          Еще нет аккаунта?
          <button 
            type="button" 
            className="register-button"
            onClick={() => navigate("/register")}
          >
            Создать аккаунт
          </button>
        </p>
      </form>
    </div>
  );
}
