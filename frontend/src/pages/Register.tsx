import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Register.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("⚠️ Имя пользователя может содержать только буквы, цифры и _.");
      return false;
    }
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
    setSuccessMessage(null);

    if (!validateInput()) return;

    setLoading(true);
    try {
      const accessToken = await register(username, password);
      if (!accessToken) throw new Error("Ошибка: Не получен Access Token.");

      setToken(accessToken);
      setUsernameStore(username);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("username", username);

      setSuccessMessage("✅ Регистрация успешна! Перенаправление...");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      setError("❌ Пользователь с таким именем уже существует.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">📝 Регистрация</h2>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="register-form">
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
            autoComplete="new-password"
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit" className="register-button" disabled={loading}>
          {loading ? "⏳ Регистрация..." : "Зарегистрироваться"}
        </button>

        <p className="login-text">
          Уже есть аккаунт?
          <button
            type="button"
            className="login-button"
            onClick={() => navigate("/login")}
          >
            Войти
          </button>
        </p>
      </form>
    </div>
  );
}
