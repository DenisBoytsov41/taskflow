import { useState } from "react";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(username, password);
      setSuccessMessage("✅ Регистрация успешна! Переход на страницу входа...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setError("Ошибка: Пользователь уже существует");
    }
  };

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Регистрация</h2>
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input 
          type="text" placeholder="Username" value={username} 
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2"
        />
        <input 
          type="password" placeholder="Password" value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">Зарегистрироваться</button>
      </form>
    </div>
  );
}
