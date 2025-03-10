import { useState } from "react";
import { useAuthStore } from "../store/auth";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((state) => state.setToken);
  const setUsernameStore = useAuthStore((state) => state.setUsername);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await login(username, password);
      console.log("Данные после логина:", response);

      if (response.data && response.data.access_token) {
        setToken(response.data.access_token);
        setUsernameStore(username);

        localStorage.setItem("token", response.data.access_token);

        navigate("/dashboard");
      } else {
        setError("Ошибка: Токен не получен");
      }
    } catch (error) {
      setError("Ошибка: Неверный логин или пароль");
    }
  };

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Вход</h2>
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
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Войти</button>
      </form>
    </div>
  );
}
